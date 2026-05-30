import type { UIMessage } from "ai";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
}

const STORAGE_PREFIX = "study-helper-sessions:";

function storageKey(documentKey: string) {
  return `${STORAGE_PREFIX}${documentKey}`;
}

export function createSession(title = "New chat"): ChatSession {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function loadSessions(documentKey: string): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(documentKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessions(documentKey: string, sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(documentKey), JSON.stringify(sessions));
}

export function deriveSessionTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user");
  if (!firstUser) return "New chat";
  for (const part of firstUser.parts) {
    if (part.type === "text" && part.text.trim()) {
      const text = part.text.trim();
      return text.length > 42 ? `${text.slice(0, 42)}…` : text;
    }
  }
  return "New chat";
}

export function documentStorageKey(filename: string, pageCount: number) {
  return `${filename}:${pageCount}`;
}
