import { useState, useRef, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatMessagesView } from "@/components/ChatMessagesView";
import { SessionSidebar, SessionListItem } from "@/components/SessionSidebar";

const STORAGE_KEY_SESSION_ID = "pm_copilot_session_id";
const USER_ID = "u_999";
const APP_NAME = "app";

// Update DisplayData to be a string type
type DisplayData = string | null;
interface MessageWithAgent {
  type: "human" | "ai";
  content: string;
  id: string;
  agent?: string;
  finalReportWithCitations?: boolean;
}

interface AdkSessionEvent {
  id?: string;
  author?: string;
  content?: { role?: string; parts?: { text?: string }[] };
}

interface AdkSession {
  id: string;
  appName: string;
  userId: string;
  state?: object;
  events?: AdkSessionEvent[];
  lastUpdateTime?: number;
}

const CITE_TAG_RE = /<cite\s+source\s*=\s*["']?\s*(src-\d+)\s*["']?\s*\/>/g;

function replaceCiteTags(
  content: string,
  sources: Record<string, any>,
): string {
  return content.replace(CITE_TAG_RE, (_match, shortId) => {
    const src = sources[shortId];
    if (src?.url) {
      const title = src.title || src.domain || shortId;
      return ` [${title}](${src.url})`;
    }
    return '';
  });
}

function stripCiteTags(content: string): string {
  return content.replace(CITE_TAG_RE, '');
}

function getSessionTitleFromEvents(events: AdkSessionEvent[] | undefined): string {
  if (!events?.length) return "新对话";
  const firstUser = events.find((e) => e.content?.role === "user");
  if (!firstUser?.content?.parts) return "新对话";
  const text = firstUser.content.parts.map((p) => p.text).filter(Boolean).join(" ");
  return text.trim().slice(0, 36) || "新对话";
}

function eventsToMessages(events: AdkSessionEvent[] | undefined): MessageWithAgent[] {
  if (!events?.length) return [];
  const out: MessageWithAgent[] = [];
  let idx = 0;
  for (const ev of events) {
    const role = ev.content?.role;
    const parts = ev.content?.parts ?? [];
    const text = parts.map((p) => p.text).filter(Boolean).join(" ").trim();
    if (!text) continue;
    const id = ev.id ?? `ev_${idx}`;
    if (role === "user") {
      out.push({ type: "human", content: text, id });
    } else if (role === "model") {
      out.push({
        type: "ai",
        content: stripCiteTags(text),
        id,
        agent: ev.author,
        finalReportWithCitations: false,
      });
    }
    idx++;
  }
  return out;
}

interface ProcessedEvent {
  title: string;
  data: any;
}

export default function ChatApp() {
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_SESSION_ID);
    } catch {
      return null;
    }
  });
  const [appName, setAppName] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithAgent[]>([]);
  const [displayData, setDisplayData] = useState<DisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageEvents, setMessageEvents] = useState<Map<string, ProcessedEvent[]>>(new Map());
  const [websiteCount, setWebsiteCount] = useState<number>(0);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);
  const [sessionList, setSessionList] = useState<SessionListItem[]>([]);
  const [sessionListLoading, setSessionListLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentAgentRef = useRef('');
  const accumulatedTextRef = useRef("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<Record<string, any>>({});

  const retryWithBackoff = async (
    fn: () => Promise<any>,
    maxRetries: number = 10,
    maxDuration: number = 120000 // 2 minutes
  ): Promise<any> => {
    const startTime = Date.now();
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (Date.now() - startTime > maxDuration) {
        throw new Error(`Retry timeout after ${maxDuration}ms`);
      }
      
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  };

  const createSession = async (): Promise<{userId: string, sessionId: string, appName: string}> => {
    const generatedSessionId = uuidv4();
    const response = await fetch(`/api/apps/${APP_NAME}/users/${USER_ID}/sessions/${generatedSessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      userId: data.userId,
      sessionId: data.id,
      appName: data.appName
    };
  };

  const fetchSessionList = useCallback(async (): Promise<SessionListItem[]> => {
    const res = await fetch(`/api/apps/${APP_NAME}/users/${USER_ID}/sessions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) return [];
    const raw: AdkSession[] = await res.json();
    return raw.map((s) => ({
      id: s.id,
      title: getSessionTitleFromEvents(s.events),
      lastUpdateTime: s.lastUpdateTime ?? 0
    }));
  }, []);

  const loadSessionById = useCallback(async (id: string) => {
    const res = await fetch(`/api/apps/${APP_NAME}/users/${USER_ID}/sessions/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Failed to load session");
    const session: AdkSession = await res.json();
    const msgs = eventsToMessages(session.events);
    setMessages(msgs);
    setDisplayData(msgs.length ? msgs[msgs.length - 1]?.content ?? null : null);
    setMessageEvents(new Map());
    setWebsiteCount(0);
    setUserId(session.userId);
    setAppName(session.appName);
    setSessionId(session.id);
    try {
      localStorage.setItem(STORAGE_KEY_SESSION_ID, session.id);
    } catch { /* ignore */ }
  }, []);

  const handleNewChat = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setDisplayData(null);
    setMessageEvents(new Map());
    setWebsiteCount(0);
    setUserId(null);
    setAppName(null);
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION_ID);
    } catch { /* ignore */ }
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    if (id === sessionId) return;
    setSessionListLoading(true);
    loadSessionById(id).finally(() => setSessionListLoading(false));
  }, [sessionId, loadSessionById]);

  const handleDeleteSession = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const deleteSession = async () => {
      const res = await fetch(`/api/apps/${APP_NAME}/users/${USER_ID}/sessions/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) return;
      const list = await fetchSessionList();
      setSessionList(list);
      if (sessionId === id) handleNewChat();
    };
    deleteSession();
  }, [sessionId, fetchSessionList, handleNewChat]);

  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/docs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      return response.ok;
    } catch (error) {
      console.log("Backend not ready yet:", error);
      return false;
    }
  }, []);

  // Function to extract text and metadata from SSE data
  const extractDataFromSSE = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      console.log('[SSE PARSED EVENT]:', JSON.stringify(parsed, null, 2)); // DEBUG: Log parsed event

      let textParts: string[] = [];
      let agent = '';
      let finalReportWithCitations = undefined;
      let functionCall = null;
      let functionResponse = null;
      let sources = null;

      // Check if content.parts exists and has text
      if (parsed.content && parsed.content.parts) {
        textParts = parsed.content.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text);
        
        // Check for function calls
        const functionCallPart = parsed.content.parts.find((part: any) => part.functionCall);
        if (functionCallPart) {
          functionCall = functionCallPart.functionCall;
        }
        
        // Check for function responses
        const functionResponsePart = parsed.content.parts.find((part: any) => part.functionResponse);
        if (functionResponsePart) {
          functionResponse = functionResponsePart.functionResponse;
        }
      }

      // Extract agent information
      if (parsed.author) {
        agent = parsed.author;
        console.log('[SSE EXTRACT] Agent:', agent); // DEBUG: Log agent
      }

      if (parsed.actions && parsed.actions.stateDelta) {
        if (parsed.actions.stateDelta.final_report_with_citations) {
          finalReportWithCitations = parsed.actions.stateDelta.final_report_with_citations;
        }
        if (parsed.actions.stateDelta.prd_document) {
          finalReportWithCitations = parsed.actions.stateDelta.prd_document;
        }
      }

      // Extract website count from research agents
      let sourceCount = 0;
      if ((parsed.author === 'web_researcher' || parsed.author === 'enhanced_researcher')) {
        console.log('[SSE EXTRACT] Relevant agent for source count:', parsed.author); // DEBUG
        if (parsed.actions?.stateDelta?.url_to_short_id) {
          console.log('[SSE EXTRACT] url_to_short_id found:', parsed.actions.stateDelta.url_to_short_id); // DEBUG
          sourceCount = Object.keys(parsed.actions.stateDelta.url_to_short_id).length;
          console.log('[SSE EXTRACT] Calculated sourceCount:', sourceCount); // DEBUG
        } else {
          console.log('[SSE EXTRACT] url_to_short_id NOT found for agent:', parsed.author); // DEBUG
        }
      }

      // Extract sources if available
      if (parsed.actions?.stateDelta?.sources) {
        sources = parsed.actions.stateDelta.sources;
        console.log('[SSE EXTRACT] Sources found:', sources); // DEBUG
      }


      return { textParts, agent, finalReportWithCitations, functionCall, functionResponse, sourceCount, sources };
    } catch (error) {
      // Log the error and a truncated version of the problematic data for easier debugging.
      const truncatedData = data.length > 200 ? data.substring(0, 200) + "..." : data;
      console.error('Error parsing SSE data. Raw data (truncated): "', truncatedData, '". Error details:', error);
      return { textParts: [], agent: '', finalReportWithCitations: undefined, functionCall: null, functionResponse: null, sourceCount: 0, sources: null };
    }
  };

  // Define getEventTitle here or ensure it's in scope from where it's used
  const getEventTitle = (agentName: string): string => {
    switch (agentName) {
      case "plan_generator":
        return "生成研究计划";
      case "section_planner":
        return "设计报告结构";
      case "web_researcher":
        return "Web 研究";
      case "research_evaluator":
        return "评估研究质量";
      case "escalation_checker":
        return "质量检查";
      case "enhanced_researcher":
        return "补充研究";
      case "research_pipeline":
        return "执行研究流水线";
      case "iterative_refinement_loop":
        return "迭代优化";
      case "research_composer":
        return "撰写研究报告";
      case "knowledge_researcher":
        return "知识库检索";
      case "prd_composer":
        return "撰写 PRD";
      case "prd_pipeline":
        return "生成 PRD";
      case "root_agent":
        return "任务调度";
      default:
        return `处理中 (${agentName || '未知'})`;
    }
  };

  const processSseEventData = (jsonData: string, aiMessageId: string) => {
    const { textParts, agent, finalReportWithCitations, functionCall, functionResponse, sourceCount, sources } = extractDataFromSSE(jsonData);

    if (sourceCount > 0) {
      console.log('[SSE HANDLER] Updating websiteCount. Current sourceCount:', sourceCount);
      setWebsiteCount(prev => Math.max(prev, sourceCount));
    }

    if (agent && agent !== currentAgentRef.current) {
      currentAgentRef.current = agent;
    }

    if (functionCall) {
      const functionCallTitle = `Function Call: ${functionCall.name}`;
      console.log('[SSE HANDLER] Adding Function Call timeline event:', functionCallTitle);
      setMessageEvents(prev => new Map(prev).set(aiMessageId, [...(prev.get(aiMessageId) || []), {
        title: functionCallTitle,
        data: { type: 'functionCall', name: functionCall.name, args: functionCall.args, id: functionCall.id }
      }]));
    }

    if (functionResponse) {
      const functionResponseTitle = `Function Response: ${functionResponse.name}`;
      console.log('[SSE HANDLER] Adding Function Response timeline event:', functionResponseTitle);
      setMessageEvents(prev => new Map(prev).set(aiMessageId, [...(prev.get(aiMessageId) || []), {
        title: functionResponseTitle,
        data: { type: 'functionResponse', name: functionResponse.name, response: functionResponse.response, id: functionResponse.id }
      }]));
    }

    if (textParts.length > 0 && agent !== "research_composer" && agent !== "prd_composer") {
      if (agent !== "root_agent") {
        const eventTitle = getEventTitle(agent);
        console.log('[SSE HANDLER] Adding Text timeline event for agent:', agent, 'Title:', eventTitle, 'Data:', textParts.join(" "));
        setMessageEvents(prev => new Map(prev).set(aiMessageId, [...(prev.get(aiMessageId) || []), {
          title: eventTitle,
          data: { type: 'text', content: textParts.join(" ") }
        }]));
      } else { // root_agent text updates the main AI message
        for (const text of textParts) {
          accumulatedTextRef.current += text + " ";
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, content: accumulatedTextRef.current.trim(), agent: currentAgentRef.current || msg.agent } : msg
          ));
          setDisplayData(accumulatedTextRef.current.trim());
        }
      }
    }

    if (sources) {
      console.log('[SSE HANDLER] Adding Retrieved Sources timeline event:', sources);
      sourcesRef.current = { ...sourcesRef.current, ...sources };
      setMessageEvents(prev => new Map(prev).set(aiMessageId, [...(prev.get(aiMessageId) || []), {
        title: "Retrieved Sources", data: { type: 'sources', content: sources }
      }]));
    }

    if ((agent === "research_composer" || agent === "prd_composer") && finalReportWithCitations) {
      const processed = replaceCiteTags(finalReportWithCitations as string, sourcesRef.current);
      const finalReportMessageId = Date.now().toString() + "_final";
      setMessages(prev => [...prev, { type: "ai", content: processed, id: finalReportMessageId, agent: currentAgentRef.current, finalReportWithCitations: true }]);
      setDisplayData(processed);
    }
  };

  const handleSubmit = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // Create session if it doesn't exist
      let currentUserId = userId;
      let currentSessionId = sessionId;
      let currentAppName = appName;
      
      if (!currentSessionId || !currentUserId || !currentAppName) {
        console.log('Creating new session...');
        const sessionData = await retryWithBackoff(createSession);
        currentUserId = sessionData.userId;
        currentSessionId = sessionData.sessionId;
        currentAppName = sessionData.appName;

        setUserId(currentUserId);
        setSessionId(currentSessionId);
        setAppName(currentAppName);
        try {
          if (currentSessionId) localStorage.setItem(STORAGE_KEY_SESSION_ID, currentSessionId);
        } catch { /* ignore */ }
        fetchSessionList().then(setSessionList);
        console.log('Session created successfully:', { currentUserId, currentSessionId, currentAppName });
      }

      // Add user message to chat
      const userMessageId = Date.now().toString();
      setMessages(prev => [...prev, { type: "human", content: query, id: userMessageId }]);

      // Create AI message placeholder
      const aiMessageId = Date.now().toString() + "_ai";
      currentAgentRef.current = ''; // Reset current agent
      accumulatedTextRef.current = ''; // Reset accumulated text

      setMessages(prev => [...prev, {
        type: "ai",
        content: "",
        id: aiMessageId,
        agent: '',
      }]);

      // Send the message with retry logic
      const sendMessage = async () => {
        const response = await fetch("/api/run_sse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appName: currentAppName,
            userId: currentUserId,
            sessionId: currentSessionId,
            newMessage: {
              parts: [{ text: query }],
              role: "user"
            },
            streaming: false
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
        }
        
        return response;
      };

      const response = await retryWithBackoff(sendMessage);

      // Handle SSE streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = ""; 
      let eventDataBuffer = "";

      if (reader) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();

          if (value) {
            lineBuffer += decoder.decode(value, { stream: true });
          }
          
          let eolIndex;
          // Process all complete lines in the buffer, or the remaining buffer if 'done'
          while ((eolIndex = lineBuffer.indexOf('\n')) >= 0 || (done && lineBuffer.length > 0)) {
            let line: string;
            if (eolIndex >= 0) {
              line = lineBuffer.substring(0, eolIndex);
              lineBuffer = lineBuffer.substring(eolIndex + 1);
            } else { // Only if done and lineBuffer has content without a trailing newline
              line = lineBuffer;
              lineBuffer = "";
            }

            if (line.trim() === "") { // Empty line: dispatch event
              if (eventDataBuffer.length > 0) {
                // Remove trailing newline before parsing
                const jsonDataToParse = eventDataBuffer.endsWith('\n') ? eventDataBuffer.slice(0, -1) : eventDataBuffer;
                console.log('[SSE DISPATCH EVENT]:', jsonDataToParse.substring(0, 200) + "..."); // DEBUG
                processSseEventData(jsonDataToParse, aiMessageId);
                eventDataBuffer = ""; // Reset for next event
              }
            } else if (line.startsWith('data:')) {
              eventDataBuffer += line.substring(5).trimStart() + '\n'; // Add newline as per spec for multi-line data
            } else if (line.startsWith(':')) {
              // Comment line, ignore
            } // Other SSE fields (event, id, retry) can be handled here if needed
          }

          if (done) {
            // If the loop exited due to 'done', and there's still data in eventDataBuffer
            // (e.g., stream ended after data lines but before an empty line delimiter)
            if (eventDataBuffer.length > 0) {
              const jsonDataToParse = eventDataBuffer.endsWith('\n') ? eventDataBuffer.slice(0, -1) : eventDataBuffer;
              console.log('[SSE DISPATCH FINAL EVENT]:', jsonDataToParse.substring(0,200) + "..."); // DEBUG
              processSseEventData(jsonDataToParse, aiMessageId);
              eventDataBuffer = ""; // Clear buffer
            }
            break; // Exit the while(true) loop
          }
        }
      }

      setIsLoading(false);

    } catch (error) {
      console.error("Error:", error);
      // Update the AI message placeholder with an error message
      const aiMessageId = Date.now().toString() + "_ai_error";
      setMessages(prev => [...prev, { 
        type: "ai", 
        content: `Sorry, there was an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        id: aiMessageId 
      }]);
      setIsLoading(false);
    }
  }, [processSseEventData, userId, sessionId, appName, fetchSessionList]);

  // Auto-scroll to latest message when messages change (e.g. after send)
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollViewport) {
          scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(scrollToBottom));
  }, [messages]);

  useEffect(() => {
    const checkBackend = async () => {
      setIsCheckingBackend(true);

      const maxAttempts = 60;
      let attempts = 0;

      while (attempts < maxAttempts) {
        const isReady = await checkBackendHealth();
        if (isReady) {
          setIsBackendReady(true);
          setIsCheckingBackend(false);
          return;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setIsCheckingBackend(false);
      console.error("Backend failed to start within 2 minutes");
    };

    checkBackend();
  }, [checkBackendHealth]);

  const initialRestoreDone = useRef(false);
  useEffect(() => {
    if (!isBackendReady || initialRestoreDone.current) return;
    initialRestoreDone.current = true;
    setSessionListLoading(true);
    fetchSessionList()
      .then((list) => {
        setSessionList(list);
        try {
          const persistedId = localStorage.getItem(STORAGE_KEY_SESSION_ID);
          if (persistedId != null && persistedId !== "" && list.some((s) => s.id === persistedId)) {
            return loadSessionById(persistedId);
          }
        } catch { /* ignore */ }
      })
      .finally(() => setSessionListLoading(false));
  }, [isBackendReady, fetchSessionList, loadSessionById]);

  const handleCancel = useCallback(() => {
    setMessages([]);
    setDisplayData(null);
    setMessageEvents(new Map());
    setWebsiteCount(0);
    setIsLoading(false);
  }, []);

  const BackendLoadingScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="w-full max-w-2xl z-10
                      bg-white/80 backdrop-blur-xl 
                      p-8 rounded-3xl border border-[#E5E0D8] 
                      shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-serif font-bold text-[#1A1A1A] flex items-center justify-center gap-3">
            Research Terminal
          </h1>
          
          <div className="flex flex-col items-center space-y-4">
            {/* Spinning animation */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#E5E0D8] border-t-[#D9653B] rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#F4A261] rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xl text-[#1A1A1A]">
                正在连接智能终端...
              </p>
              <p className="text-sm text-[#666666]">
                首次启动可能需要一点时间
              </p>
            </div>
            
            {/* Animated dots */}
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#D9653B] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-[#F4A261] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-[#E9C46A] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans antialiased selection:bg-[#D9653B]/30">
      {isBackendReady && (
        <SessionSidebar
          sessions={sessionList}
          currentSessionId={sessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
          loading={sessionListLoading}
        />
      )}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div
          className={
            messages.length > 0 && !isCheckingBackend
              ? "flex-1 min-h-0 flex flex-col overflow-hidden"
              : `flex-1 overflow-y-auto ${(messages.length === 0 || isCheckingBackend) ? "flex" : ""}`
          }
        >
          {isCheckingBackend ? (
            <BackendLoadingScreen />
          ) : !isBackendReady ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-red-500">后端服务未响应</h2>
                <p className="text-[#666666]">
                  无法连接到后端服务：{import.meta.env.VITE_API_BASE || "http://localhost:8000"}
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-2 bg-[#D9653B] text-white hover:bg-[#c2552e] rounded-full transition-colors shadow-md shadow-[#D9653B]/20"
                >
                  重试
                </button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <WelcomeScreen
              handleSubmit={(q) => void handleSubmit(q)}
              isLoading={isLoading}
              onCancel={handleCancel}
            />
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <ChatMessagesView
                messages={messages}
                isLoading={isLoading}
              scrollAreaRef={scrollAreaRef}
              onSubmit={(q) => void handleSubmit(q)}
              onCancel={handleCancel}
              onNewChat={handleNewChat}
              displayData={displayData}
                messageEvents={messageEvents}
                websiteCount={websiteCount}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
