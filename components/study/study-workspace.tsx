"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UIMessage } from "ai";

import { ChatHistorySidebar } from "@/components/chat/chat-history-sidebar";
import { StudyChatPanel } from "@/components/chat/study-chat-panel";
import { FlowchartCanvas } from "@/components/flowchart/flowchart-canvas";
import {
  createSession,
  deriveSessionTitle,
  documentStorageKey,
  loadSessions,
  saveSessions,
  type ChatSession,
} from "@/lib/chat/sessions";
import { collectFlowchartsFromMessages } from "@/lib/mermaid/collect-flowcharts";
import type { ParsedDocument } from "@/lib/parse/types";

interface StudyWorkspaceProps {
  document: ParsedDocument;
  onReplaceDocument?: () => void;
}

export function StudyWorkspace({ document, onReplaceDocument }: StudyWorkspaceProps) {
  const docKey = documentStorageKey(document.filename, document.pageCount);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const prevChartCountRef = useRef(0);

  useEffect(() => {
    const stored = loadSessions(docKey);
    if (stored.length === 0) {
      const initial = createSession();
      setSessions([initial]);
      setActiveSessionId(initial.id);
    } else {
      setSessions(stored);
      setActiveSessionId(stored[0]!.id);
    }
    setSelectedChartId(null);
    prevChartCountRef.current = 0;
    setHydrated(true);
  }, [docKey]);

  useEffect(() => {
    if (!hydrated) return;
    saveSessions(docKey, sessions);
  }, [docKey, hydrated, sessions]);

  const activeSession = sessions.find((session) => session.id === activeSessionId);

  const flowcharts = useMemo(
    () => collectFlowchartsFromMessages(activeSession?.messages ?? []),
    [activeSession?.messages],
  );

  useEffect(() => {
    if (flowcharts.length > prevChartCountRef.current) {
      setSelectedChartId(flowcharts.at(-1)!.id);
    } else if (flowcharts.length > 0 && !selectedChartId) {
      setSelectedChartId(flowcharts.at(-1)!.id);
    }
    prevChartCountRef.current = flowcharts.length;
  }, [flowcharts, selectedChartId]);

  const handleMessagesChange = useCallback(
    (messages: UIMessage[]) => {
      setSessions((current) => {
        const active = current.find((session) => session.id === activeSessionId);
        if (
          active &&
          JSON.stringify(active.messages) === JSON.stringify(messages)
        ) {
          return current;
        }

        return current.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                messages,
                title: deriveSessionTitle(messages),
                updatedAt: Date.now(),
              }
            : session,
        );
      });
    },
    [activeSessionId],
  );

  const handleNewChat = useCallback(() => {
    const session = createSession();
    setSessions((current) => [session, ...current]);
    setActiveSessionId(session.id);
    setSelectedChartId(null);
    prevChartCountRef.current = 0;
  }, []);

  const handleSelectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setSelectedChartId(null);
    prevChartCountRef.current = 0;
  }, []);

  if (!hydrated || !activeSession) {
    return null;
  }

  return (
    <div className="flex h-[calc(100dvh)] min-h-0 w-full overflow-hidden">
      <ChatHistorySidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        documentLabel={document.filename}
        onSelect={handleSelectSession}
        onNewChat={handleNewChat}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted/10 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold">Study canvas</h1>
            <p className="text-xs text-muted-foreground">
              {document.filename} · {document.pageCount} pages
            </p>
          </div>
          {onReplaceDocument && (
            <button
              type="button"
              onClick={onReplaceDocument}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Upload different PDF
            </button>
          )}
        </div>
        <FlowchartCanvas
          flowcharts={flowcharts}
          selectedId={selectedChartId}
          onSelect={setSelectedChartId}
        />
      </main>

      <StudyChatPanel
        key={activeSessionId}
        document={document}
        sessionId={activeSessionId}
        initialMessages={activeSession.messages}
        onMessagesChange={handleMessagesChange}
      />
    </div>
  );
}
