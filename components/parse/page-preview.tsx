"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ParsedDocument } from "@/lib/parse/types";
import { cn } from "@/lib/utils";

interface PagePreviewProps {
  document: ParsedDocument;
}

export function PagePreview({ document }: PagePreviewProps) {
  const [selectedPage, setSelectedPage] = useState(1);
  const [showJson, setShowJson] = useState(false);

  const page = useMemo(
    () => document.pages.find((item) => item.page === selectedPage),
    [document.pages, selectedPage],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Parsed content</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowJson((value) => !value)}
        >
          {showJson ? "Hide JSON" : "Show JSON"}
        </Button>
      </div>

      {showJson ? (
        <pre className="max-h-[480px] overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs leading-relaxed">
          {JSON.stringify(document, null, 2)}
        </pre>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {document.pages.map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => setSelectedPage(item.page)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  selectedPage === item.page
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                Page {item.page}
              </button>
            ))}
          </div>

          {page && (
            <div className="rounded-lg border border-border bg-background">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
                <span>
                  {page.width.toFixed(0)} × {page.height.toFixed(0)} pt
                </span>
                <span>{page.text_items.length} text items</span>
              </div>
              <div className="max-h-[420px] overflow-auto p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {page.text || "(no text extracted)"}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
