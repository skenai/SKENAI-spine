import { describe, expect, it } from 'vitest';
import { buildSignalSpan, parseSignalDocIdFromSpan } from '../span/signal-span.js';

describe('signal-span', () => {
  it('formats a signal SPAN', () => {
    expect(buildSignalSpan('doc_abc123')).toBe('span://v1/skenai/signals/doc_abc123');
  });

  it('round-trips build → parse', () => {
    for (const id of ['doc_abc123', 'a', 'doc-with-dashes_123']) {
      expect(parseSignalDocIdFromSpan(buildSignalSpan(id))).toBe(id);
    }
  });

  it('parses spans with surrounding whitespace', () => {
    expect(parseSignalDocIdFromSpan('  span://v1/skenai/signals/doc_x \n')).toBe('doc_x');
  });

  it('rejects non-signal spans and junk', () => {
    expect(parseSignalDocIdFromSpan('span://v1/skenai/tenants/example')).toBeNull();
    expect(parseSignalDocIdFromSpan('span://v2/skenai/signals/doc_x')).toBeNull();
    expect(parseSignalDocIdFromSpan('https://skenai.net/signals/doc_x')).toBeNull();
    expect(parseSignalDocIdFromSpan('not a span')).toBeNull();
  });

  it('returns null for nullish input', () => {
    expect(parseSignalDocIdFromSpan(null)).toBeNull();
    expect(parseSignalDocIdFromSpan(undefined)).toBeNull();
    expect(parseSignalDocIdFromSpan('')).toBeNull();
  });
});
