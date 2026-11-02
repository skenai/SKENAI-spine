/** SPAN for crystallized external signal documents (hopper doc_id). */
export function buildSignalSpan(docId: string): string {
  return `span://v1/skenai/signals/${docId}`;
}

export function parseSignalDocIdFromSpan(span: string | null | undefined): string | null {
  if (!span) return null;
  const m = /^span:\/\/v1\/skenai\/signals\/(.+)$/.exec(span.trim());
  return m?.[1] ?? null;
}
