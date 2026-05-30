import { MAX_DOCUMENT_CHARS } from "./config";

import type { ParsedDocument } from "@/lib/parse/types";

export interface DocumentContextResult {
  text: string;
  truncated: boolean;
  pageCount: number;
  includedPages: number;
}

export function buildDocumentContext(
  document: ParsedDocument,
): DocumentContextResult {
  const parts: string[] = [];
  let totalLength = 0;
  let includedPages = 0;
  let truncated = false;

  for (const page of document.pages) {
    const block = `--- Page ${page.page} ---\n${page.text.trim()}`;
    if (totalLength + block.length > MAX_DOCUMENT_CHARS) {
      truncated = true;
      break;
    }
    parts.push(block);
    totalLength += block.length + 2;
    includedPages += 1;
  }

  let text = parts.join("\n\n");
  if (truncated) {
    text += `\n\n[Document truncated: showing ${includedPages} of ${document.pageCount} pages due to context limit.]`;
  }

  return {
    text,
    truncated,
    pageCount: document.pageCount,
    includedPages,
  };
}

export function buildSystemPrompt(
  documentContext: string,
  filename: string,
  meta: Pick<DocumentContextResult, "truncated" | "pageCount" | "includedPages">,
): string {
  const scope = meta.truncated
    ? `${meta.includedPages}/${meta.pageCount} pages`
    : `${meta.pageCount} pages`;

  return `You are a study assistant helping the user learn from an uploaded document.

Document: "${filename}" (${scope})

Rules:
- Answer only from the document content below unless the user asks for general study tips.
- Cite page numbers when referencing specific provisions (e.g. "Page 12").
- When the user asks to generate, create, or show a flowchart/diagram/decision tree, you MUST call the generateFlowchart tool with valid Mermaid source (no code fences in the tool argument).
- For other procedural topics you may also include a \`\`\`mermaid code block in text when helpful.
- Keep answers concise and exam-focused unless the user asks for detail.
- If the answer is not in the document, say so clearly.

Document content:
${documentContext}`;
}
