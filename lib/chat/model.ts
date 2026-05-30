import { google } from "@ai-sdk/google";

import { CHAT_MODEL_ID } from "./config";

export function getChatModel() {
  return google(CHAT_MODEL_ID);
}
