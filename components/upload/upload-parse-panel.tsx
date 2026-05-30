"use client";

import { useCallback, useState } from "react";

import { ParseStatus } from "@/components/parse/parse-status";
import { StudyWorkspace } from "@/components/study/study-workspace";
import { PdfDropzone } from "@/components/upload/pdf-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ParsedDocument, ParseErrorResponse } from "@/lib/parse/types";

type Status =
  | { state: "idle" }
  | { state: "parsing"; filename: string }
  | { state: "success"; filename: string; pageCount: number }
  | { state: "error"; message: string; hint?: string };

export function UploadParsePanel() {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [document, setDocument] = useState<ParsedDocument | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setDocument(null);
    setStatus({ state: "parsing", filename: file.name });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ParsedDocument | ParseErrorResponse;

      if (!response.ok) {
        const err = data as ParseErrorResponse;
        setStatus({
          state: "error",
          message: err.error ?? "Parse failed",
          hint: err.hint,
        });
        return;
      }

      const parsed = data as ParsedDocument;
      setDocument(parsed);
      setStatus({
        state: "success",
        filename: parsed.filename,
        pageCount: parsed.pageCount,
      });
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "Network error while parsing",
      });
    }
  }, []);

  const parsing = status.state === "parsing";

  if (document) {
    return (
      <StudyWorkspace
        document={document}
        onReplaceDocument={() => {
          setDocument(null);
          setStatus({ state: "idle" });
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-16">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Study Helper</h1>
        <p className="text-sm text-muted-foreground">
          Upload a PDF to parse it, chat with Gemini, and generate study
          flowcharts.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Upload document</CardTitle>
          <CardDescription>PDF only · max 20MB</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PdfDropzone
            onFileSelect={handleFileSelect}
            parsing={parsing}
            disabled={parsing}
          />
          <ParseStatus {...status} />
        </CardContent>
      </Card>
    </div>
  );
}
