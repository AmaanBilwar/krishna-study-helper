import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

import {
  buildSystemPrompt,
  type DocumentContextResult,
} from "@/lib/chat/document-context";
import { GOOGLE_API_KEY_ENV, MAX_OUTPUT_TOKENS } from "@/lib/chat/config";
import { getChatModel } from "@/lib/chat/model";

export const maxDuration = 60;

interface ChatRequestBody {
  messages: UIMessage[];
  documentContext?: string;
  filename?: string;
  documentMeta?: Pick<
    DocumentContextResult,
    "truncated" | "pageCount" | "includedPages"
  >;
}

export async function POST(request: Request) {
  if (!process.env[GOOGLE_API_KEY_ENV]) {
    return Response.json(
      {
        error: `${GOOGLE_API_KEY_ENV} is not configured. Add your Google AI API key to .env.local.`,
      },
      { status: 503 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, documentContext, filename, documentMeta } = body;

  if (!messages?.length) {
    return Response.json({ error: "Messages are required" }, { status: 400 });
  }

  if (!documentContext?.trim()) {
    return Response.json(
      { error: "Upload and parse a document before chatting" },
      { status: 400 },
    );
  }

  const result = streamText({
    model: getChatModel(),
    system: buildSystemPrompt(
      documentContext,
      filename ?? "Uploaded document",
      documentMeta ?? {
        truncated: false,
        pageCount: 0,
        includedPages: 0,
      },
    ),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });

  return result.toUIMessageStreamResponse();
}
