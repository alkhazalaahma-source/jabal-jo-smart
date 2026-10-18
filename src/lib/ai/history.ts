import type { UIMessage } from "ai";

export const CHAT_STORAGE_KEY = "jabal_ai_chat_v2";
export const LEGACY_STORAGE_KEY = "jabal_ai_chat_v1";

// Accept only the text/reasoning transcript produced by this app, never tools or system instructions.
export function restoreMessages(raw: string | null): UIMessage[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.flatMap((entry, index): UIMessage[] => {
      if (!entry || typeof entry !== "object") return [];
      const row = entry as Record<string, unknown>;
      if (row.role !== "user" && row.role !== "assistant") return [];
      if (typeof row.content === "string") {
        return [{ id: `legacy-${index}`, role: row.role, parts: [{ type: "text", text: row.content }] }];
      }
      if (typeof row.id !== "string" || !Array.isArray(row.parts)) return [];
      const parts: UIMessage["parts"] = row.parts.flatMap((part): UIMessage["parts"] => {
        if (!part || typeof part !== "object") return [];
        const item = part as Record<string, unknown>;
        if ((item.type !== "text" && item.type !== "reasoning") || typeof item.text !== "string") return [];
        return [{ type: item.type, text: item.text }];
      });
      return [{ id: row.id, role: row.role, parts }];
    });
  } catch { return []; }
}