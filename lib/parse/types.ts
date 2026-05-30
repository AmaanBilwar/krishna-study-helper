export interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font_name?: string;
  font_size?: number;
  confidence?: number;
}

export interface ParsedPage {
  page: number;
  width: number;
  height: number;
  text: string;
  text_items: TextItem[];
}

export interface ParsedDocument {
  pages: ParsedPage[];
  text: string;
  pageCount: number;
  filename: string;
  parsedAt: string;
}

export interface ParseErrorResponse {
  error: string;
  hint?: string;
}
