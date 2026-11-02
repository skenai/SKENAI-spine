import { describe, expect, it } from 'vitest';
import {
  amountCovers,
  buildPaymentRequired,
  decodeHeader,
  encodeHeader,
  mockFacilitator,
  payloadDigest,
  X402_HEADER_REQUIRED,
  X402_HEADER_RESPONSE,
  X402_HEADER_SIGNATURE,
  X402_VERSION,
  type PaymentPayload,
} from '../a2a/x402.js';

const PAY_TO = '0x000000000000000000000000000000000000dEaD';

describe('x402 headers', () => {
  it('names the three transport headers', () => {
    expect(X402_HEADER_REQUIRED).toBe('payment-required');
    expect(X402_HEADER_SIGNATURE).toBe('payment-signature');
    expect(X402_HEADER_RESPONSE).toBe('payment-response');
  });

  it('encodes and decodes a header value', () => {
    const value = { a: 1, b: 'x' };
    const encoded = encodeHeader(value);
    expect(encoded).toBe(Buffer.from(JSON.stringify(value), 'utf8').toString('base64'));
    expect(decodeHeader<typeof value>(encoded)).toEqual(value);
    expect(decodeHeader(null)).toBeNull();
    expect(decodeHeader('%%%not-base64%%%')).toBeNull();
  });
});

describe('buildPaymentRequired', () => {
  const base = {
    tool: 'skenai-william-compliance',
    description: 'Export-control classify',
    resourceUrl: 'https://skenai.net/api/a2a/run',
    amountUsd: 0.25,
    inputSchema: { type: 'object' },
  };

  it('builds the v2 challenge shape', () => {
    const pr = buildPaymentRequired({ ...base, payTo: PAY_TO });
    expect(pr).not.toBeNull();
    expect(pr!.x402Version).toBe(X402_VERSION);
    expect(pr!.error).toBe('Payment Required');
    expect(pr!.resource.url).toBe(base.resourceUrl);
    expect(pr!.resource.mimeType).toBe('application/json');
    expect(pr!.accepts).toHaveLength(1);
    const req = pr!.accepts[0]!;
    expect(req.scheme).toBe('exact');
    expect(req.network).toBe('eip155:8453'); // defaults to Base mainnet
    expect(req.amount).toBe('250000'); // USDC atomic
    expect(req.payTo).toBe(PAY_TO);
    expect(req.extra.tool).toBe(base.tool);
    expect(pr!.extensions.bazaar.info.input).toEqual(base.inputSchema);
    expect(pr!.extensions.bazaar.info.output).toEqual({ type: 'json' });
  });

  it('honours an explicit network', () => {
    const pr = buildPaymentRequired({ ...base, payTo: PAY_TO, network: 'eip155:84532' });
    expect(pr!.accepts[0]!.network).toBe('eip155:84532');
    expect(pr!.accepts[0]!.asset).toBe('0x036CbD53842c5426634e7929541eC2318f3dCF7e');
  });

  it('returns null without a payTo', () => {
    expect(buildPaymentRequired({ ...base, payTo: '' })).toBeNull();
    expect(buildPaymentRequired({ ...base, payTo: '   ' })).toBeNull();
  });
});

describe('payloadDigest', () => {
  const payload: PaymentPayload = {
    x402Version: 2,
    scheme: 'exact',
    network: 'eip155:8453',
    payload: { amount: '250000', payTo: PAY_TO, signature: 'sig' },
  };

  it('is deterministic for the same payload', () => {
    expect(payloadDigest(payload)).toBe(payloadDigest({ ...payload }));
    expect(payloadDigest(payload)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes when the payload changes', () => {
    const other = { ...payload, payload: { ...payload.payload, amount: '1' } };
    expect(payloadDigest(other)).not.toBe(payloadDigest(payload));
  });
});

describe('amountCovers / mockFacilitator', () => {
  it('compares amounts as bigint', () => {
    const p: PaymentPayload = { x402Version: 2, payload: { amount: '250000' } };
    expect(amountCovers(p, '250000')).toBe(true);
    expect(amountCovers(p, '250001')).toBe(false);
    expect(amountCovers({ x402Version: 2, payload: {} }, '1')).toBe(false);
  });

  it('mock facilitator refuses unless explicitly allowed, then dedupes replays', async () => {
    const seen = new Set<string>();
    const p: PaymentPayload = { x402Version: 2, payload: { signature: 'sig' } };
    const req = {
      scheme: 'exact' as const,
      network: 'eip155:8453' as const,
      amount: '1',
      asset: 'x',
      payTo: PAY_TO,
      maxTimeoutSeconds: 60,
      extra: { name: 'USDC', tool: 't' },
    };

    const off = await mockFacilitator(seen).verifyAndSettle(p, req);
    expect(off).toMatchObject({ success: false, error: 'mock_disabled' });

    const on = mockFacilitator(seen, { allow: true });
    const first = await on.verifyAndSettle(p, req);
    expect(first.success).toBe(true);
    expect(first.transaction).toMatch(/^mock:[0-9a-f]{16}$/);
    const replay = await on.verifyAndSettle(p, req);
    expect(replay).toMatchObject({ success: false, error: 'replay' });
  });
});
