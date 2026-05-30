import { tool } from "ai";
import { z } from "zod";

export const generateFlowchartTool = tool({
  description:
    "Generate a Mermaid flowchart for study. Call this when the user asks for a flowchart, diagram, decision tree, or visual summary of a procedure from the document.",
  inputSchema: z.object({
    title: z.string().describe("Short title shown in the flowchart panel"),
    mermaid: z
      .string()
      .describe(
        "Valid Mermaid diagram source only — no markdown fences. Prefer flowchart TD or LR syntax.",
      ),
  }),
  execute: async ({ title, mermaid }) => ({ title, mermaid }),
});

export const chatTools = {
  generateFlowchart: generateFlowchartTool,
};
