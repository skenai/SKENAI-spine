/**
 * x402 v2 HTTP transport for one paid tool call.
 * Headers: PAYMENT-REQUIRED, PAYMENT-SIGNATURE, PAYMENT-RESPONSE (base64 JSON).
 * Verify and settle go to the CDP facilitator when a key is configured.
 *
 * Spine note: all configuration is passed as parameters — the engine's
 * environment reads were removed. The spine does no I/O on its own;
 * the facilitator helper fetches only when the caller invokes it.
 */
import { createHash } from 'node:crypto';

export const X402_VERSION = 2 as const;
export const X402_HEADER_REQUIRED = 'payment-required';
export const X402_HEADER_SIGNATURE = 'payment-signature';
export const X402_HEADER_RESPONSE = 'payment-response';

const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_BASE_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

export type X402Network = 'eip155:8453' | 'eip155:84532';

export type PaymentRequirements = {
  scheme: 'exact';
  network: X402Network;
  amount: string;
  asset: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra: { name: string; tool: string };
};

export type PaymentRequired = {
  x402Version: typeof X402_VERSION;
  error: 'Payment Required';
  resource: { url: string; description: string; mimeType: 'application/json' };
  accepts: PaymentRequirements[];
  extensions: {
    bazaar: {
      info: { input: Record<string, unknown>; output: { type: 'json' } };
    };
  };
};

export type PaymentPayload = {
  x402Version: number;
  scheme?: string;
  network?: string;
  payload: {
    amount?: string;
    payTo?: string;
    asset?: string;
    nonce?: string;
    signature?: string;
  };
};

export type SettlementResponse = {
  success: boolean;
  transaction?: string;
  network: string;
  error?: string;
};

export type Facilitator = {
  verifyAndSettle(
    payload: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<SettlementResponse>;
};

export function x402Network(preferred?: X402Network | null): X402Network {
  return preferred === 'eip155:84532' ? 'eip155:84532' : 'eip155:8453';
}

export function x402PayTo(payTo?: string | null): string | null {
  const trimmed = payTo?.trim();
  return trimmed || null;
}

export function usdToAtomicUsdc(usd: number): string {
  return String(Math.round(usd * 1_000_000));
}

export function buildPaymentRequired(input: {
  tool: string;
  description: string;
  resourceUrl: string;
  amountUsd: number;
  inputSchema: Record<string, unknown>;
  /** Settlement address for the exact-scheme requirement. Returns null when empty. */
  payTo: string;
  /** Defaults to Base mainnet (eip155:8453). */
  network?: X402Network;
}): PaymentRequired | null {
  const payTo = x402PayTo(input.payTo);
  if (!payTo) return null;
  const network = x402Network(input.network);
  return {
    x402Version: X402_VERSION,
    error: 'Payment Required',
    resource: {
      url: input.resourceUrl,
      description: input.description,
      mimeType: 'application/json',
    },
    accepts: [
      {
        scheme: 'exact',
        network,
        amount: usdToAtomicUsdc(input.amountUsd),
        asset: network === 'eip155:84532' ? USDC_BASE_SEPOLIA : USDC_BASE,
        payTo,
        maxTimeoutSeconds: 60,
        extra: { name: 'USDC', tool: input.tool },
      },
    ],
    extensions: {
      bazaar: {
        info: { input: input.inputSchema, output: { type: 'json' } },
      },
    },
  };
}

export function encodeHeader(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64');
}

export function decodeHeader<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function payloadDigest(payload: PaymentPayload): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function amountCovers(payload: PaymentPayload, requiredAtomic: string): boolean {
  try {
    return BigInt(payload.payload?.amount ?? '0') >= BigInt(requiredAtomic);
  } catch {
    return false;
  }
}

export function cdpFacilitator(credentials: {
  keyId?: string | null;
  keySecret?: string | null;
  baseUrl?: string;
}): Facilitator {
  const base = (credentials.baseUrl ?? 'https://api.cdp.coinbase.com/platform/v2/x402').replace(
    /\/$/,
    '',
  );
  const keyId = credentials.keyId?.trim();
  const keySecret = credentials.keySecret?.trim();
  return {
    async verifyAndSettle(payload, requirements) {
      if (!keyId || !keySecret) {
        return { success: false, network: requirements.network, error: 'cdp_unconfigured' };
      }
      const headers = {
        Authorization: `Bearer ${keySecret}`,
        'X-CDP-API-KEY-ID': keyId,
        'Content-Type': 'application/json',
      };
      const body = JSON.stringify({
        x402Version: X402_VERSION,
        paymentPayload: payload,
        paymentRequirements: requirements,
      });
      const verify = await fetch(`${base}/verify`, { method: 'POST', headers, body });
      if (!verify.ok) {
        return { success: false, network: requirements.network, error: `verify_${verify.status}` };
      }
      const settle = await fetch(`${base}/settle`, { method: 'POST', headers, body });
      const json = (await settle.json().catch(() => ({}))) as { transaction?: string; error?: string };
      if (!settle.ok) {
        return { success: false, network: requirements.network, error: json.error ?? `settle_${settle.status}` };
      }
      return { success: true, network: requirements.network, transaction: json.transaction };
    },
  };
}

/** Test and smoke facilitator. Refuses unless opts.allow is true. */
export function mockFacilitator(seen: Set<string>, opts?: { allow?: boolean }): Facilitator {
  return {
    async verifyAndSettle(payload, requirements) {
      if (opts?.allow !== true) {
        return { success: false, network: requirements.network, error: 'mock_disabled' };
      }
      const digest = payloadDigest(payload);
      if (seen.has(digest)) {
        return { success: false, network: requirements.network, error: 'replay' };
      }
      if (!payload.payload?.signature) {
        return { success: false, network: requirements.network, error: 'missing_signature' };
      }
      seen.add(digest);
      return { success: true, network: requirements.network, transaction: `mock:${digest.slice(0, 16)}` };
    },
  };
}
