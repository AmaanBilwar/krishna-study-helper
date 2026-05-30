"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StudyMarkdownProps {
  content: string;
  className?: string;
}

function stripMermaidFences(text: string) {
  return text.replace(
    /```mermaid[\s\S]*?```/gi,
    "*Flowchart added to the canvas.*",
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-3 text-base font-semibold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-3 text-sm font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2 text-sm font-medium first:mt-0">{children}</h3>
  ),
  p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-md bg-muted px-2 py-1.5 font-mono text-xs">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-md border bg-muted/50 p-2">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary underline-offset-4 hover:underline"
    >
      {children}
    </a>
  ),
};

export function StudyMarkdown({ content, className }: StudyMarkdownProps) {
  const hasMermaid = /```mermaid/i.test(content);
  const cleaned = stripMermaidFences(content);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {hasMermaid && (
        <Badge variant="secondary" className="self-start">
          Flowchart added to canvas
        </Badge>
      )}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}
