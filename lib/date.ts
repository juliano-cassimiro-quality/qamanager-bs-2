import { parseISO } from "date-fns";

export function safeParseTimestamp(timestamp: string | null | undefined) {
  if (!timestamp) return null;
  try {
    return parseISO(timestamp);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Timestamp inválido detectado", error);
    }
    return null;
  }
}
