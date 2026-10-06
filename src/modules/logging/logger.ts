/** Sanitised logger: only static event names and error classes, never payloads, tokens or PII. */
export function logEvent(event: string, meta: Record<string, string | number | boolean> = {}) {
  console.log(JSON.stringify({ event, ...meta }));
}

export function logError(event: string, err: unknown) {
  console.error(JSON.stringify({ event, error: err instanceof Error ? err.name : "UnknownError" }));
}
