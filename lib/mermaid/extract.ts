export interface FlowchartArtifact {
  id: string;
  title: string;
  source: string;
  messageId?: string;
  createdAt: number;
}

const MERMAID_BLOCK = /```mermaid\s*\n([\s\S]*?)```/gi;

export function extractMermaidBlocks(text: string): string[] {
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = MERMAID_BLOCK.exec(text)) !== null) {
    const source = match[1]?.trim();
    if (source) blocks.push(source);
  }
  return blocks;
}

export function isFlowchartRequest(text: string): boolean {
  return /\b(flow\s*chart|flowchart|diagram|mermaid|visuali[sz]e|decision tree)\b/i.test(
    text,
  );
}
