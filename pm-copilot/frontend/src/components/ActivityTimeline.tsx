import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Activity,
  Info,
  Search,
  TextSearch,
  Brain,
  Pen,
  ChevronDown,
  ChevronUp,
  Link,
  BookOpen,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export interface ProcessedEvent {
  title: string;
  data: any;
}

interface ActivityTimelineProps {
  processedEvents: ProcessedEvent[];
  isLoading: boolean;
  websiteCount: number;
}

export function ActivityTimeline({
  processedEvents,
  isLoading,
  websiteCount,
}: ActivityTimelineProps) {
  const [isTimelineCollapsed, setIsTimelineCollapsed] =
    useState<boolean>(false);

  const formatEventData = (data: any): string => {
    // Handle new structured data types
    if (typeof data === "object" && data !== null && data.type) {
      switch (data.type) {
        case 'functionCall':
          return `Calling function: ${data.name}\nArguments: ${JSON.stringify(data.args, null, 2)}`;
        case 'functionResponse':
          return `Function ${data.name} response:\n${JSON.stringify(data.response, null, 2)}`;
        case 'text':
          return data.content;
        case 'sources':
          const sources = data.content as Record<string, { title: string; url: string }>;
          if (Object.keys(sources).length === 0) {
            return "No sources found.";
          }
          return Object.values(sources)
            .map(source => `[${source.title || 'Untitled Source'}](${source.url})`).join(', ');
        default:
          return JSON.stringify(data, null, 2);
      }
    }
    
    // Existing logic for backward compatibility
    if (typeof data === "string") {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        // If not JSON, return as string (could be markdown)
        return data;
      }
    } else if (Array.isArray(data)) {
      return data.join(", ");
    } else if (typeof data === "object" && data !== null) {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  const isJsonData = (data: any): boolean => {
    // Handle new structured data types
    if (typeof data === "object" && data !== null && data.type) {
      if (data.type === 'sources') {
        return false; // Let ReactMarkdown handle this
      }
      return data.type === 'functionCall' || data.type === 'functionResponse';
    }
    
    // Existing logic
    if (typeof data === "string") {
      try {
        JSON.parse(data);
        return true;
      } catch {
        return false;
      }
    }
    return typeof data === "object" && data !== null;
  };
  const getEventIcon = (title: string, index: number) => {
    if (index === 0 && isLoading && processedEvents.length === 0) {
      return <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />;
    }
    const t = title.toLowerCase();
    if (t.includes("function call")) {
      return <Activity className="h-4 w-4 text-blue-400" />;
    } else if (t.includes("function response")) {
      return <Activity className="h-4 w-4 text-green-400" />;
    } else if (t.includes("知识库") || t.includes("knowledge")) {
      return <BookOpen className="h-4 w-4 text-purple-400" />;
    } else if (t.includes("prd")) {
      return <FileText className="h-4 w-4 text-emerald-400" />;
    } else if (t.includes("评估") || t.includes("质量") || t.includes("evaluat")) {
      return <ClipboardCheck className="h-4 w-4 text-amber-400" />;
    } else if (t.includes("研究") || t.includes("research") || t.includes("web")) {
      return <Search className="h-4 w-4 text-blue-300" />;
    } else if (t.includes("报告") || t.includes("撰写") || t.includes("compos")) {
      return <Pen className="h-4 w-4 text-neutral-400" />;
    } else if (t.includes("计划") || t.includes("结构") || t.includes("plan") || t.includes("structur")) {
      return <Brain className="h-4 w-4 text-neutral-400" />;
    } else if (t.includes("retrieved sources") || t.includes("sources")) {
      return <Link className="h-4 w-4 text-yellow-400" />;
    } else if (t.includes("迭代") || t.includes("refin")) {
      return <TextSearch className="h-4 w-4 text-neutral-400" />;
    }
    return <Activity className="h-4 w-4 text-neutral-400" />;
  };

  useEffect(() => {
    if (!isLoading && processedEvents.length !== 0) {
      setIsTimelineCollapsed(true);
    }
  }, [isLoading, processedEvents]);
  return (
    <Card className={`border border-[#E5E0D8] rounded-2xl bg-[#FAF9F6] shadow-sm transition-all duration-300 ${isTimelineCollapsed ? "h-12 py-3" : "max-h-96 py-3"}`}>
      <CardHeader className="py-0">
        <CardDescription className="flex items-center justify-between">
          <div
            className="flex items-center justify-start text-sm w-full cursor-pointer gap-2 text-[#1A1A1A] font-medium"
            onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
          >
            <span>Research</span>
            {websiteCount > 0 && (
              <span className="text-xs bg-[#D9653B]/10 text-[#D9653B] px-2.5 py-0.5 rounded-full">
                {websiteCount} websites
              </span>
            )}
            {isTimelineCollapsed ? (
              <ChevronDown className="h-4 w-4 mr-2 text-[#666666]" />
            ) : (
              <ChevronUp className="h-4 w-4 mr-2 text-[#666666]" />
            )}
          </div>
        </CardDescription>
      </CardHeader>
      {!isTimelineCollapsed && (
        <ScrollArea className="max-h-80 overflow-y-auto mt-4">
          <CardContent>
            {isLoading && processedEvents.length === 0 && (
              <div className="relative pl-8 pb-4">
                <div className="absolute left-3 top-3.5 h-full w-0.5 bg-[#E5E0D8]" />
                <div className="absolute left-0.5 top-2 h-5 w-5 rounded-full bg-white flex items-center justify-center ring-4 ring-[#FAF9F6] border border-[#E5E0D8]">
                  <Loader2 className="h-3 w-3 text-[#D9653B] animate-spin" />
                </div>
                <div>
                  <p className="text-sm text-[#666666] font-medium">
                    思考中...
                  </p>
                </div>
              </div>
            )}
            {processedEvents.length > 0 ? (
              <div className="space-y-0">
                {processedEvents.map((eventItem, index) => (
                  <div key={index} className="relative pl-8 pb-6">
                    {index < processedEvents.length - 1 ||
                    (isLoading && index === processedEvents.length - 1) ? (
                      <div className="absolute left-3 top-3.5 h-full w-0.5 bg-[#E5E0D8]" />
                    ) : null}
                    <div className="absolute left-0.5 top-2 h-6 w-6 rounded-full bg-white flex items-center justify-center ring-4 ring-[#FAF9F6] border border-[#E5E0D8]">
                      {getEventIcon(eventItem.title, index)}
                    </div>
                    <div>
                      <p className="text-sm text-[#1A1A1A] font-medium mb-1">
                        {eventItem.title}
                      </p>
                      <div className="text-xs text-[#666666] leading-relaxed">
                        {isJsonData(eventItem.data) ? (
                          <pre className="bg-white border border-[#E5E0D8] p-3 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap mt-2">
                            {formatEventData(eventItem.data)}
                          </pre>
                        ) : (
                          <div className="mt-1">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <span>{children}</span>,
                                a: ({ href, children }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#D9653B] hover:text-[#c2552e] underline"
                                  >
                                    {children}
                                  </a>
                                ),
                                code: ({ children }) => (
                                  <code className="bg-[#F0EBE1] text-[#D9653B] px-1.5 py-0.5 rounded text-xs">
                                    {children}
                                  </code>
                                ),
                              }}
                            >
                              {formatEventData(eventItem.data)}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && processedEvents.length > 0 && (
                  <div className="relative pl-8 pb-4">
                    <div className="absolute left-0.5 top-2 h-5 w-5 rounded-full bg-white flex items-center justify-center ring-4 ring-[#FAF9F6] border border-[#E5E0D8]">
                      <Loader2 className="h-3 w-3 text-[#D9653B] animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm text-[#666666] font-medium">
                        思考中...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-[#999999] pt-6 pb-2">
                <Info className="h-6 w-6 mb-2 text-[#E5E0D8]" />
                <p className="text-sm">暂无活动记录</p>
              </div>
            ) : null}
          </CardContent>
        </ScrollArea>
      )}
    </Card>
  );
}
