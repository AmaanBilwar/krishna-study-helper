import type { UIMessage } from "ai";

import { extractMermaidBlocks, type FlowchartArtifact } from "./extract";

interface ToolOutput {
  title?: string;
  mermaid?: string;
}

export function collectFlowchartsFromMessages(
  messages: UIMessage[],
): FlowchartArtifact[] {
  const charts: FlowchartArtifact[] = [];

  for (const message of messages) {
    if (message.role !== "assistant") continue;

    for (const part of message.parts) {
      if (part.type === "tool-generateFlowchart") {
        if (part.state !== "output-available" && part.state !== "input-available") {
          continue;
        }
        const output = (part.state === "output-available"
          ? part.output
          : part.input) as ToolOutput | undefined;
        const source = output?.mermaid?.trim();
        if (!source) continue;
        charts.push({
          id: part.toolCallId,
          title: output?.title?.trim() || "Study flowchart",
          source,
          messageId: message.id,
          createdAt: Date.now(),
        });
        continue;
      }

      if (part.type === "text") {
        const blocks = extractMermaidBlocks(part.text);
        blocks.forEach((source, index) => {
          charts.push({
            id: `${message.id}-mermaid-${index}`,
            title: `Flowchart ${charts.length + 1}`,
            source,
            messageId: message.id,
            createdAt: Date.now(),
          });
        });
      }
    }
  }

  return charts;
}
