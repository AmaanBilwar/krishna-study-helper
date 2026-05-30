import type { LiteParseInput } from "@llamaindex/liteparse";

import type { ParsedDocument, ParsedPage, TextItem } from "./types";

const DEFAULT_OCR = process.env.LITEPARSE_OCR !== "false";

function normalizeTextItem(item: {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
  fontSize?: number;
  confidence?: number;
}): TextItem {
  return {
    text: item.text,
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    font_name: item.fontName,
    font_size: item.fontSize,
    confidence: item.confidence,
  };
}

function normalizePage(page: {
  pageNum?: number;
  page?: number;
  width: number;
  height: number;
  text: string;
  textItems?: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontName?: string;
    fontSize?: number;
    confidence?: number;
  }>;
  text_items?: TextItem[];
}): ParsedPage {
  const textItems = page.textItems ?? page.text_items ?? [];
  return {
    page: page.pageNum ?? page.page ?? 1,
    width: page.width,
    height: page.height,
    text: page.text,
    text_items: textItems.map((item) =>
      "font_name" in item ? (item as TextItem) : normalizeTextItem(item),
    ),
  };
}

function toParsedDocument(
  pages: ParsedPage[],
  text: string,
  filename: string,
): ParsedDocument {
  return {
    pages,
    text,
    pageCount: pages.length,
    filename,
    parsedAt: new Date().toISOString(),
  };
}

async function parseLocally(
  buffer: Buffer,
  filename: string,
): Promise<ParsedDocument> {
  const { LiteParse } = await import("@llamaindex/liteparse");
  const parser = new LiteParse({
    ocrEnabled: DEFAULT_OCR,
    quiet: true,
    outputFormat: "json",
  });
  const result = await parser.parse(buffer as LiteParseInput);
  const pages = result.pages.map(normalizePage);
  return toParsedDocument(pages, result.text, filename);
}

async function parseRemote(
  buffer: Buffer,
  filename: string,
  serverUrl: string,
): Promise<ParsedDocument> {
  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: "application/pdf" }),
    filename,
  );
  form.append(
    "config",
    JSON.stringify({ ocrEnabled: DEFAULT_OCR, outputFormat: "json" }),
  );

  const response = await fetch(`${serverUrl.replace(/\/$/, "")}/parse`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `LiteParse server error (${response.status}): ${body || response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    pages?: Array<Parameters<typeof normalizePage>[0]>;
    text?: string;
  };

  if (!data.pages?.length) {
    throw new Error("LiteParse server returned no pages");
  }

  const pages = data.pages.map(normalizePage);
  const text =
    data.text ?? pages.map((page) => page.text).join("\n\n");
  return toParsedDocument(pages, text, filename);
}

export async function parseDocument(
  buffer: Buffer,
  filename: string,
): Promise<ParsedDocument> {
  const serverUrl = process.env.LITEPARSE_SERVER_URL;
  const mode = process.env.LITEPARSE_MODE ?? "auto";

  if (serverUrl && mode !== "local") {
    return parseRemote(buffer, filename, serverUrl);
  }

  try {
    return await parseLocally(buffer, filename);
  } catch (error) {
    if (serverUrl && mode === "auto") {
      return parseRemote(buffer, filename, serverUrl);
    }
    throw error;
  }
}
