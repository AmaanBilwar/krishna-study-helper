"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Loader2Icon, SendIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { StudyMarkdown } from "@/components/markdown/study-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { buildDocumentContext } from "@/lib/chat/document-context";
import { isFlowchartRequest } from "@/lib/mermaid/extract";
import type { ParsedDocument } from "@/lib/parse/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Generate a flowchart for the main procedure",
  "Summarize key exam topics",
  "What thresholds and limits matter?",
  "Quiz me on this chapter",
];

interface StudyChatPanelProps {
  document: ParsedDocument;
  sessionId: string;
  initialMessages: UIMessage[];
  onMessagesChange: (messages: UIMessage[]) => void;
}

export function StudyChatPanel({
  document,
  sessionId,
  initialMessages,
  onMessagesChange,
}: StudyChatPanelProps) {
  const [input, setInput] = useState("");
  const documentRef = useRef(document);
  documentRef.current = document;

  const contextMeta = useMemo(
    () => buildDocumentContext(document),
    [document],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({
          messages,
          id,
          trigger,
          messageId,
        }) => {
          const ctx = buildDocumentContext(documentRef.current);
          return {
            body: {
              messages,
              id,
              trigger,
              messageId,
              documentContext: ctx.text,
              filename: documentRef.current.filename,
              documentMeta: {
                truncated: ctx.truncated,
                pageCount: ctx.pageCount,
                includedPages: ctx.includedPages,
              },
            },
          };
        },
      }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: sessionId,
    messages: initialMessages,
    transport,
  });

  const lastSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    const snapshot = JSON.stringify(messages);
    if (snapshot === lastSyncedRef.current) return;
    lastSyncedRef.current = snapshot;
    onMessagesChange(messages);
  }, [messages, onMessagesChange]);

  const busy = status === "streaming" || status === "submitted";

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <aside className="flex h-full min-h-0 w-[360px] shrink-0 flex-col border-l border-border bg-background">
      <div className="border-b border-border p-4">
        <h2 className="font-medium">Study assistant</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {contextMeta.includedPages}/{contextMeta.pageCount} pages in context
        </p>
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 border-b border-border p-3">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => submit(suggestion)}
              disabled={busy}
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs hover:bg-muted disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ask for explanations or say &quot;generate a flowchart&quot; to
              populate the center canvas.
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "rounded-lg border px-3 py-2",
                message.role === "user"
                  ? "ml-6 border-primary/20 bg-primary/5"
                  : "mr-2 border-border bg-muted/20",
              )}
            >
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {message.role === "user" ? "You" : "Assistant"}
              </p>
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <StudyMarkdown
                      key={`${message.id}-${index}`}
                      content={part.text}
                    />
                  );
                }
                if (
                  part.type === "tool-generateFlowchart" &&
                  (part.state === "output-available" ||
                    part.state === "input-available")
                ) {
                  return (
                    <div key={part.toolCallId} className="mt-2">
                      <Badge variant="secondary">Flowchart added to canvas</Badge>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="animate-spin" />
              {isFlowchartRequest(input) ? "Generating flowchart…" : "Thinking…"}
            </div>
          )}
        </div>
      </ScrollArea>

      {error && (
        <p className="px-4 pb-2 text-sm text-destructive">{error.message}</p>
      )}

      <form
        className="flex flex-col gap-2 border-t border-border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
      >
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder='Try "Generate a flowchart for board quorum"'
          disabled={busy}
          rows={3}
        />
        <Button type="submit" disabled={busy || !input.trim()} className="self-end">
          <SendIcon data-icon="inline-start" />
          Send
        </Button>
      </form>
    </aside>
  );
}
