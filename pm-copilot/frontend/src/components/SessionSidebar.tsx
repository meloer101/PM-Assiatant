import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Trash2, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { cn } from "@/utils";

export interface SessionListItem {
  id: string;
  title: string;
  lastUpdateTime: number;
}

interface SessionSidebarProps {
  sessions: SessionListItem[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  loading?: boolean;
}

function formatSessionTime(ts: number): string {
  const d = new Date(ts * 1000);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return "昨天";
  }
  return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

export function SessionSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  collapsed,
  onToggleCollapsed,
  loading = false,
}: SessionSidebarProps) {
  const sortedSessions = [...sessions].sort((a, b) => b.lastUpdateTime - a.lastUpdateTime);

  return (
    <div
      className={cn(
        "flex flex-col border-r border-[#E5E0D8] bg-white/80 backdrop-blur-md transition-[width] duration-200 shrink-0",
        collapsed ? "w-12" : "w-[280px]"
      )}
    >
      <div className={cn("flex items-center h-14 shrink-0", collapsed ? "relative justify-center px-0" : "gap-2 px-3")}>
        {collapsed ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCollapsed();
              }}
              className="absolute inset-0 w-full cursor-pointer"
              title="展开侧栏"
              aria-label="展开侧栏"
            />
            <Link
              to="/"
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0 bg-[#FAF9F6] hover:bg-[#D9653B]/10 text-[#666666] hover:text-[#D9653B] transition-colors"
              title="返回主页"
            >
              <Home className="w-5 h-5" />
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/"
              className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 bg-[#FAF9F6] hover:bg-[#D9653B]/10 text-[#666666] hover:text-[#D9653B] transition-colors"
              title="返回主页"
            >
              <Home className="w-5 h-5" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 min-w-0 justify-start text-[#1A1A1A] hover:bg-[#D9653B]/10 hover:text-[#D9653B] rounded-full gap-2"
              onClick={onNewChat}
            >
              <MessageSquarePlus className="w-4 h-4 shrink-0" />
              <span className="truncate">新对话</span>
            </Button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCollapsed();
              }}
              className="p-2 rounded-lg shrink-0 text-[#666666] hover:bg-[#FAF9F6] hover:text-[#1A1A1A] transition-colors"
              title="收起侧栏"
              aria-label="收起侧栏"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
      {collapsed && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleCollapsed();
          }}
          className="flex-1 w-full flex items-center justify-center text-[#666666] hover:bg-[#FAF9F6] hover:text-[#1A1A1A] transition-colors cursor-pointer"
          title="展开侧栏"
          aria-label="展开侧栏"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="px-3 py-4 text-center text-sm text-[#999999]">加载中...</div>
          ) : sortedSessions.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-[#999999]">暂无历史会话</div>
          ) : (
            <ul className="space-y-0.5 px-2">
              {sortedSessions.map((s) => (
                <li key={s.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelectSession(s.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl truncate pr-8 transition-colors",
                      currentSessionId === s.id
                        ? "bg-[#D9653B]/10 text-[#D9653B] font-medium"
                        : "text-[#333333] hover:bg-[#FAF9F6] hover:text-[#1A1A1A]"
                    )}
                    title={s.title || "无标题"}
                  >
                    <span className="block truncate text-sm">{s.title || "新对话"}</span>
                    <span className="block text-xs mt-0.5 opacity-70">
                      {formatSessionTime(s.lastUpdateTime)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDeleteSession(s.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#999999] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="删除会话"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
