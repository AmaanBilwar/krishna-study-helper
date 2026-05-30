"use client";

import { FileUp, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PdfDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  parsing?: boolean;
}

export function PdfDropzone({
  onFileSelect,
  disabled = false,
  parsing = false,
}: PdfDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || disabled || parsing) return;
      onFileSelect(file);
    },
    [disabled, onFileSelect, parsing],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled && !parsing) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        handleFile(event.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition-colors",
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
        (disabled || parsing) && "pointer-events-none opacity-60",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={disabled || parsing}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {parsing ? (
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      ) : (
        <FileUp className="size-10 text-muted-foreground" />
      )}
      <div className="text-center">
        <p className="text-sm font-medium">
          {parsing ? "Parsing PDF…" : "Drop a PDF here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Max 20MB · PDF only</p>
      </div>
      {!parsing && (
        <Button type="button" variant="outline" size="sm">
          Choose file
        </Button>
      )}
    </div>
  );
}
