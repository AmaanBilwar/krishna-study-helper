"use client";

import {
  CopyIcon,
  DownloadIcon,
  GitBranchIcon,
  Share2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  downloadBlob,
  getSvgFromContainer,
  MermaidDiagram,
  svgToPngBlob,
} from "@/components/mermaid/mermaid-diagram";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FlowchartArtifact } from "@/lib/mermaid/extract";

interface FlowchartCanvasProps {
  flowcharts: FlowchartArtifact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function FlowchartCanvas({
  flowcharts,
  selectedId,
  onSelect,
}: FlowchartCanvasProps) {
  const diagramContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const activeId = selectedId ?? flowcharts.at(-1)?.id ?? null;
  const active = flowcharts.find((chart) => chart.id === activeId) ?? null;

  useEffect(() => {
    if (!activeId && flowcharts.length > 0) {
      onSelect(flowcharts.at(-1)!.id);
    }
  }, [activeId, flowcharts, onSelect]);

  async function copyMermaid() {
    if (!active) return;
    await navigator.clipboard.writeText(active.source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadSvg() {
    if (!active) return;
    const svg = getSvgFromContainer(diagramContainerRef.current);
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    downloadBlob(blob, `${slugify(active.title)}.svg`);
  }

  async function downloadPng() {
    if (!active) return;
    const svg = getSvgFromContainer(diagramContainerRef.current);
    if (!svg) return;
    const blob = await svgToPngBlob(svg);
    downloadBlob(blob, `${slugify(active.title)}.png`);
  }

  async function shareChart() {
    if (!active) return;
    const svg = getSvgFromContainer(diagramContainerRef.current);
    const shareText = `${active.title}\n\n\`\`\`mermaid\n${active.source}\n\`\`\``;

    if (navigator.share) {
      try {
        if (svg) {
          const png = await svgToPngBlob(svg);
          const file = new File([png], `${slugify(active.title)}.png`, {
            type: "image/png",
          });
          await navigator.share({
            title: active.title,
            text: shareText,
            files: [file],
          });
          return;
        }
        await navigator.share({ title: active.title, text: shareText });
        return;
      } catch {
        /* fall through to clipboard */
      }
    }

    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (flowcharts.length === 0) {
    return (
      <Empty className="h-full border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <GitBranchIcon />
          </EmptyMedia>
          <EmptyTitle>Flowchart canvas</EmptyTitle>
          <EmptyDescription>
            Ask the assistant to generate a flowchart. It will appear here with
            download and share options.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 py-0">
      <CardHeader className="border-b py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle>{active?.title ?? "Flowcharts"}</CardTitle>
            <CardDescription>
              {flowcharts.length} diagram{flowcharts.length === 1 ? "" : "s"} in
              this chat
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{flowcharts.length} total</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm">
                  <Share2Icon data-icon="inline-start" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => void shareChart()}>
                  <Share2Icon data-icon="inline-start" />
                  Share / copy link text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void copyMermaid()}>
                  <CopyIcon data-icon="inline-start" />
                  {copied ? "Copied!" : "Copy Mermaid source"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void downloadSvg()}>
                  <DownloadIcon data-icon="inline-start" />
                  Download SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void downloadPng()}>
                  <DownloadIcon data-icon="inline-start" />
                  Download PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 py-4">
        <Tabs
          value={activeId ?? undefined}
          onValueChange={onSelect}
          className="flex min-h-0 flex-1 flex-col gap-3"
        >
          <ScrollArea className="w-full">
            <TabsList className="h-auto w-max">
              {flowcharts.map((chart, index) => (
                <TabsTrigger key={chart.id} value={chart.id}>
                  {chart.title || `Chart ${index + 1}`}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {active && (
            <div ref={diagramContainerRef} className="min-h-0 flex-1">
              <MermaidDiagram source={active.source} />
            </div>
          )}
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 border-t">
        <Button variant="outline" size="sm" onClick={() => void downloadSvg()}>
          <DownloadIcon data-icon="inline-start" />
          SVG
        </Button>
        <Button variant="outline" size="sm" onClick={() => void downloadPng()}>
          <DownloadIcon data-icon="inline-start" />
          PNG
        </Button>
        <Button variant="outline" size="sm" onClick={() => void copyMermaid()}>
          <CopyIcon data-icon="inline-start" />
          {copied ? "Copied" : "Mermaid"}
        </Button>
      </CardFooter>
    </Card>
  );
}
