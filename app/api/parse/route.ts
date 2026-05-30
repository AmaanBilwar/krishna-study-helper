import { NextResponse } from "next/server";

import { parseDocument } from "@/lib/parse/client";
import type { ParseErrorResponse } from "@/lib/parse/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 20 * 1024 * 1024;

function errorResponse(
  error: string,
  status: number,
  hint?: string,
): NextResponse<ParseErrorResponse> {
  return NextResponse.json({ error, hint }, { status });
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Invalid form data", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return errorResponse("Missing file field", 400);
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return errorResponse("Only PDF files are supported", 400);
  }

  if (file.size > MAX_BYTES) {
    return errorResponse("File exceeds 20MB limit", 400);
  }

  if (file.size === 0) {
    return errorResponse("File is empty", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await parseDocument(buffer, file.name);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse document";
    const hint =
      process.env.LITEPARSE_SERVER_URL || process.env.LITEPARSE_MODE === "local"
        ? undefined
        : "For Vercel production, set LITEPARSE_SERVER_URL to a running liteparse-server instance.";

    return errorResponse(message, 500, hint);
  }
}
