"use client";

import { MessageSquarePlusIcon, MessagesSquareIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ChatSession } from "@/lib/chat/sessions";
import { cn } from "@/lib/utils";

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  documentLabel: string;
  onSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

export function ChatHistorySidebar({
  sessions,
  activeSessionId,
  documentLabel,
  onSelect,
  onNewChat,
}: ChatHistorySidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col border-r border-border bg-muted/20">
      <div className="flex flex-col gap-2 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <MessagesSquareIcon />
          <h2 className="font-medium">Chats</h2>
        </div>
        <p className="truncate text-xs text-muted-foreground" title={documentLabel}>
          {documentLabel}
        </p>
        <Button size="sm" onClick={onNewChat}>
          <MessageSquarePlusIcon data-icon="inline-start" />
          New chat
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-1 p-2">
          {sessions.length === 0 && (
            <p className="px-2 py-4 text-xs text-muted-foreground">
              No chats yet. Start one to generate study flowcharts.
            </p>
          )}
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelect(session.id)}
              className={cn(
                "flex flex-col gap-1 rounded-lg border px-3 py-2 text-left transition-colors",
                session.id === activeSessionId
                  ? "border-primary bg-background"
                  : "border-transparent hover:bg-background/80",
              )}
            >
              <span className="line-clamp-2 text-sm font-medium">{session.title}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {session.messages.length} msgs
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      <Separator />
      <p className="p-3 text-[10px] text-muted-foreground">
        History saved locally until Supabase is connected.
      </p>
    </aside>
  );
}
