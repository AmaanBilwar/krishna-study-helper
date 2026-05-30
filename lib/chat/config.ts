/** Cheapest Gemini Flash on Google AI — override with AI_MODEL if needed */
export const CHAT_MODEL_ID =
  process.env.AI_MODEL ?? "gemini-2.5-flash";

/** ~30k tokens rough budget for document context */
export const MAX_DOCUMENT_CHARS = Number(
  process.env.MAX_DOCUMENT_CHARS ?? 120_000,
);

export const MAX_OUTPUT_TOKENS = Number(
  process.env.AI_MAX_OUTPUT_TOKENS ?? 4096,
);

/** @see https://ai.google.dev/gemini-api/docs/api-key */
export const GOOGLE_API_KEY_ENV = "GOOGLE_GENERATIVE_AI_API_KEY";
