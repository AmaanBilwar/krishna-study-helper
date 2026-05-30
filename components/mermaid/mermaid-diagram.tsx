"use client";

import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

import { Skeleton } from "@/components/ui/skeleton";

let mermaidReady = false;

function ensureMermaid() {
  if (mermaidReady) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "neutral",
    securityLevel: "strict",
  });
  mermaidReady = true;
}

interface MermaidDiagramProps {
  source: string;
  className?: string;
}

export function MermaidDiagram({ source, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureMermaid();
    let cancelled = false;

    async function renderDiagram() {
      setLoading(true);
      setError(null);
      try {
        const { svg } = await mermaid.render(`diagram-${reactId}`, source);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (renderError) {
        if (!cancelled) {
          setError(
            renderError instanceof Error
              ? renderError.message
              : "Failed to render diagram",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [reactId, source]);

  if (error) {
    return (
      <pre className="overflow-auto rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">
        {error}
      </pre>
    );
  }

  return (
    <div className={className}>
      {loading && <Skeleton className="h-64 w-full rounded-lg" />}
      <div
        ref={containerRef}
        className="flex justify-center overflow-auto [&_svg]:max-h-[min(70vh,720px)] [&_svg]:max-w-full"
        hidden={loading}
      />
    </div>
  );
}

export function getSvgFromContainer(container: HTMLElement | null): string | null {
  const svg = container?.querySelector("svg");
  if (!svg) return null;
  return svg.outerHTML;
}

export async function svgToPngBlob(svg: string): Promise<Blob> {
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
  const url = `data:image/svg+xml,${encoded}`;
  const image = new Image();
  image.src = url;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load SVG"));
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || 1200;
  canvas.height = image.naturalHeight || 800;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export PNG"));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
