import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Copy, CopyCheck } from "lucide-react";
import { InputForm } from "@/components/InputForm";
import { Button } from "@/components/ui/button";
import { useState, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { cn } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { ActivityTimeline } from "@/components/ActivityTimeline";

// Markdown component props type from former ReportView
type MdComponentProps = {
  className?: string;
  children?: ReactNode;
  [key: string]: any;
};

interface ProcessedEvent {
  title: string;
  data: any;
}

// Markdown components (from former ReportView.tsx)
const mdComponents = {
  h1: ({ className, children, ...props }: MdComponentProps) => (
    <h1 className={cn("text-2xl font-bold mt-4 mb-2 text-[#1A1A1A]", className)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ className, children, ...props }: MdComponentProps) => (
    <h2 className={cn("text-xl font-bold mt-3 mb-2 text-[#1A1A1A]", className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }: MdComponentProps) => (
    <h3 className={cn("text-lg font-bold mt-3 mb-1 text-[#1A1A1A]", className)} {...props}>
      {children}
    </h3>
  ),
  p: ({ className, children, ...props }: MdComponentProps) => (
    <p className={cn("mb-3 leading-7 text-[#333333]", className)} {...props}>
      {children}
    </p>
  ),
  a: ({ className, children, href, ...props }: MdComponentProps) => (
    <Badge className="text-xs mx-0.5 bg-[#D9653B]/10 text-[#D9653B] hover:bg-[#D9653B]/20 border-0">
      <a
        className={cn("text-[#D9653B] hover:text-[#c2552e] text-xs", className)}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    </Badge>
  ),
  ul: ({ className, children, ...props }: MdComponentProps) => (
    <ul className={cn("list-disc pl-6 mb-3 text-[#333333]", className)} {...props}>
      {children}
    </ul>
  ),
  ol: ({ className, children, ...props }: MdComponentProps) => (
    <ol className={cn("list-decimal pl-6 mb-3 text-[#333333]", className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ className, children, ...props }: MdComponentProps) => (
    <li className={cn("mb-1", className)} {...props}>
      {children}
    </li>
  ),
  blockquote: ({ className, children, ...props }: MdComponentProps) => (
    <blockquote
      className={cn(
        "border-l-4 border-[#D9653B] pl-4 italic my-3 text-sm text-[#666666] bg-[#D9653B]/5 py-2 pr-4 rounded-r-lg",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }: MdComponentProps) => (
    <code
      className={cn(
        "bg-[#F0EBE1] text-[#D9653B] rounded px-1.5 py-0.5 font-mono text-xs",
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ className, children, ...props }: MdComponentProps) => (
    <pre
      className={cn(
        "bg-[#F8F6F0] border border-[#E5E0D8] p-4 rounded-xl overflow-x-auto font-mono text-xs my-3 text-[#333333]",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  hr: ({ className, ...props }: MdComponentProps) => (
    <hr className={cn("border-[#E5E0D8] my-6", className)} {...props} />
  ),
  table: ({ className, children, ...props }: MdComponentProps) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-[#E5E0D8]">
      <table className={cn("border-collapse w-full text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ className, children, ...props }: MdComponentProps) => (
    <th
      className={cn(
        "border-b border-[#E5E0D8] bg-[#F8F6F0] px-4 py-3 text-left font-bold text-[#1A1A1A]",
        className
      )}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ className, children, ...props }: MdComponentProps) => (
    <td
      className={cn("border-b border-[#E5E0D8] px-4 py-3 text-[#333333]", className)}
      {...props}
    >
      {children}
    </td>
  ),
};

// Props for HumanMessageBubble
interface HumanMessageBubbleProps {
  message: { content: string; id: string };
  mdComponents: typeof mdComponents;
}

// HumanMessageBubble Component
const HumanMessageBubble: React.FC<HumanMessageBubbleProps> = ({
  message,
  mdComponents,
}) => {
  return (
    <div className="text-white rounded-3xl break-words min-h-7 bg-[#D9653B] max-w-[100%] sm:max-w-[90%] px-5 py-3 rounded-br-sm shadow-sm">
      <ReactMarkdown components={{...mdComponents, p: ({children}) => <p className="m-0">{children}</p>}} remarkPlugins={[remarkGfm]}>
        {message.content}
      </ReactMarkdown>
    </div>
  );
};

// Props for AiMessageBubble
interface AiMessageBubbleProps {
  message: { content: string; id: string };
  mdComponents: typeof mdComponents;
  handleCopy: (text: string, messageId: string) => void;
  copiedMessageId: string | null;
  agent?: string;
  finalReportWithCitations?: boolean;
  processedEvents: ProcessedEvent[];
  websiteCount: number;
  isLoading: boolean;
}

// AiMessageBubble Component
const AiMessageBubble: React.FC<AiMessageBubbleProps> = ({
  message,
  mdComponents,
  handleCopy,
  copiedMessageId,
  agent,
  finalReportWithCitations,
  processedEvents,
  websiteCount,
  isLoading,
}) => {
  // Show ActivityTimeline if we have processedEvents (this will be the first AI message)
  const shouldShowTimeline = processedEvents.length > 0;
  
  // Condition for DIRECT DISPLAY (interactive_planner_agent OR final report)
  const shouldDisplayDirectly = 
    agent === "root_agent" || 
    ((agent === "research_composer" || agent === "prd_composer") && finalReportWithCitations);
  
  if (shouldDisplayDirectly) {
    // Direct display - show content with copy button, and timeline if available
    return (
      <div className="relative break-words flex flex-col w-full bg-white rounded-3xl p-6 shadow-sm border border-[#E5E0D8]">
        {/* Show timeline for interactive_planner_agent if available */}
        {shouldShowTimeline && agent === "root_agent" && (
          <div className="w-full mb-4">
            <ActivityTimeline 
              processedEvents={processedEvents}
              isLoading={isLoading}
              websiteCount={websiteCount}
            />
          </div>
        )}
        <div className="flex items-start gap-4">
          <div className="flex-1 text-[#1A1A1A]">
            <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          <button
            onClick={() => handleCopy(message.content, message.id)}
            className="p-2 hover:bg-[#FAF9F6] rounded-xl transition-colors text-[#999999] hover:text-[#D9653B]"
          >
            {copiedMessageId === message.id ? (
              <CopyCheck className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    );
  } else if (shouldShowTimeline) {
    // First AI message with timeline only (no direct content display)
    return (
      <div className="relative break-words flex flex-col w-full bg-white rounded-3xl p-6 shadow-sm border border-[#E5E0D8]">
        <div className="w-full">
          <ActivityTimeline 
            processedEvents={processedEvents}
            isLoading={isLoading}
            websiteCount={websiteCount}
          />
        </div>
        {/* Only show accumulated content if it's not empty and not from research agents */}
        {message.content && message.content.trim() && agent !== "root_agent" && (
          <div className="flex items-start gap-4 mt-4 pt-4 border-t border-[#E5E0D8]">
            <div className="flex-1 text-[#1A1A1A]">
              <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
            <button
              onClick={() => handleCopy(message.content, message.id)}
              className="p-2 hover:bg-[#FAF9F6] rounded-xl transition-colors text-[#999999] hover:text-[#D9653B]"
            >
              {copiedMessageId === message.id ? (
                <CopyCheck className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
      </div>
    );
  } else {
    // Fallback for other messages - just show content
    return (
      <div className="relative break-words flex flex-col w-full bg-white rounded-3xl p-6 shadow-sm border border-[#E5E0D8]">
        <div className="flex items-start gap-4">
          <div className="flex-1 text-[#1A1A1A]">
            <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          <button
            onClick={() => handleCopy(message.content, message.id)}
            className="p-2 hover:bg-[#FAF9F6] rounded-xl transition-colors text-[#999999] hover:text-[#D9653B]"
          >
            {copiedMessageId === message.id ? (
              <CopyCheck className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    );
  }
};

interface ChatMessagesViewProps {
  messages: { type: "human" | "ai"; content: string; id: string; agent?: string; finalReportWithCitations?: boolean }[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (query: string) => void;
  onCancel: () => void;
  onNewChat: () => void;
  displayData: string | null;
  messageEvents: Map<string, ProcessedEvent[]>;
  websiteCount: number;
}

export function ChatMessagesView({
  messages,
  isLoading,
  scrollAreaRef,
  onSubmit,
  onCancel,
  onNewChat,
  messageEvents,
  websiteCount,
}: ChatMessagesViewProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Find the ID of the last AI message
  const lastAiMessage = messages.slice().reverse().find(m => m.type === "ai");
  const lastAiMessageId = lastAiMessage?.id;

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-[#FAF9F6]">
      {/* Header with New Chat button */}
      <div className="shrink-0 border-b border-[#E5E0D8] p-4 bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-serif font-bold text-[#1A1A1A] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D9653B]"></span>
            Steven
          </h1>
          <Button
            onClick={onNewChat}
            variant="outline"
            className="bg-white hover:bg-[#FAF9F6] text-[#1A1A1A] border-[#E5E0D8] hover:border-[#D9653B]/50 transition-colors rounded-full px-5"
          >
            新对话
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-1 w-full h-full">
          <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => { // Removed index as it's not directly used for this logic
              const eventsForMessage = message.type === "ai" ? (messageEvents.get(message.id) || []) : [];
              
              // Determine if the current AI message is the last one
              const isCurrentMessageTheLastAiMessage = message.type === "ai" && message.id === lastAiMessageId;

              return (
                <div
                  key={message.id}
                  className={`flex ${message.type === "human" ? "justify-end" : "justify-start"}`}
                >
                  {message.type === "human" ? (
                    <HumanMessageBubble
                      message={message}
                      mdComponents={mdComponents}
                    />
                  ) : (
                    <AiMessageBubble
                      message={message}
                      mdComponents={mdComponents}
                      handleCopy={handleCopy}
                      copiedMessageId={copiedMessageId}
                      agent={message.agent}
                      finalReportWithCitations={message.finalReportWithCitations}
                      processedEvents={eventsForMessage}
                      // MODIFIED: Pass websiteCount only if it's the last AI message
                      websiteCount={isCurrentMessageTheLastAiMessage ? websiteCount : 0}
                      // MODIFIED: Pass isLoading only if it's the last AI message and global isLoading is true
                      isLoading={isCurrentMessageTheLastAiMessage && isLoading}
                    />
                  )}
                </div>
              );
            })}
            {/* This global "Thinking..." indicator appears below all messages if isLoading is true */}
            {/* It's independent of the per-timeline isLoading state */}
            {isLoading && !lastAiMessage && messages.some(m => m.type === 'human') && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 text-[#D9653B] bg-white px-4 py-2 rounded-full shadow-sm border border-[#E5E0D8]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">思考中...</span>
                </div>
              </div>
            )}
             {/* Show "Thinking..." if the last message is human and we are loading, 
                 or if there's an active AI message that is the last one and we are loading.
                 The AiMessageBubble's internal isLoading will handle its own spinner.
                 This one is for the general loading state at the bottom.
             */}
            {isLoading && messages.length > 0 && messages[messages.length -1].type === 'human' && (
                 <div className="flex justify-start pt-2"> {/* Adjusted padding to align similarly to AI bubble */}
                    <div className="flex items-center gap-3 text-[#D9653B] bg-white px-4 py-2 rounded-full shadow-sm border border-[#E5E0D8]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">思考中...</span>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="shrink-0 border-t border-[#E5E0D8] p-4 w-full bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <InputForm onSubmit={onSubmit} isLoading={isLoading} context="chat" />
          {isLoading && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={onCancel}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 rounded-full px-6"
              >
                取消
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
