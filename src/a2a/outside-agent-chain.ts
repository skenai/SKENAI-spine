/**
 * Outside-agent chain — the one ordered path a foreign agent (OpenAI Dots,
 * Grok Bot, Meta Muse, any MCP/HTTP client) walks to do business on SKENAI:
 * discover → identify → work → pay → settle → prove.
 *
 * Contract: skenai.outside_agent_chain.v0
 * Served at GET /api/a2a and synced into /.well-known/agents.json by
 * scripts/generate-agents-json.mjs. Kept free of `@/` imports so the
 * generator can load it with plain node.
 */
import { AWI_CONTRACT, AWI_HEADER, AWI_SETTLE_BIND_ACTION } from '../awi/awi-contract.js';

export const OUTSIDE_AGENT_CHAIN_CONTRACT = 'skenai.outside_agent_chain.v0' as const;
export const OUTSIDE_AGENT_CHAIN_HOST = 'https://skenai.net' as const;

export type OutsideAgentStepKind = 'discover' | 'identify' | 'work' | 'pay' | 'settle' | 'prove';

/**
 * none             — open, no Authorization header
 * sk_agent         — Bearer sk_agent_… identity token (read / telemetry / emit; never moves XP)
 * sk_ext           — Bearer sk_ext_… per-tenant settlement key
 * payment          — x402 / Stripe / Telegram Stars proof on the request (402 without it)
 */
export type OutsideAgentCredential = 'none' | 'sk_agent' | 'sk_ext' | 'payment';

export interface OutsideAgentStep {
  step: OutsideAgentStepKind;
  id: string;
  method: 'GET' | 'POST';
  /** Path on OUTSIDE_AGENT_CHAIN_HOST. `/api/...` paths must resolve to a route.ts. */
  path: string;
  credential: OutsideAgentCredential;
  writes_state: boolean;
  /** True only when the call can move XP or settle a job. */
  moves_xp: boolean;
  does: string;
  honesty: string;
}

export const OUTSIDE_AGENT_CHAIN: readonly OutsideAgentStep[] = [
  {
    step: 'discover',
    id: 'agents_card',
    method: 'GET',
    path: '/.well-known/agents.json',
    credential: 'none',
    writes_state: false,
    moves_xp: false,
    does: 'Publisher card: MCP gateway, open tools, this chain.',
    honesty: 'Static file synced from code; not a live capability probe.',
  },
  {
    step: 'discover',
    id: 'chain',
    method: 'GET',
    path: '/api/a2a',
    credential: 'none',
    writes_state: false,
    moves_xp: false,
    does: 'This chain, step by step, with the credential each step needs.',
    honesty: 'Manifest only; each step enforces its own auth.',
  },
  {
    step: 'discover',
    id: 'paid_tools_openapi',
    method: 'GET',
    path: '/api/a2a/openapi',
    credential: 'none',
    writes_state: false,
    moves_xp: false,
    does: 'OpenAPI 3.1 for per-call paid tools.',
    honesty: 'Evidence, not certification.',
  },
  {
    step: 'discover',
    id: 'mcp_tools_list',
    method: 'POST',
    path: '/api/mcp',
    credential: 'none',
    writes_state: false,
    moves_xp: false,
    does: 'JSON-RPC tools/list; open tools/call for discovery and deal tools.',
    honesty: 'Mutating tools/call needs a membrane session or Bearer.',
  },
  {
    step: 'identify',
    id: 'agent_token_verify',
    method: 'GET',
    path: '/api/membrane/agent-token/verify',
    credential: 'sk_agent',
    writes_state: false,
    moves_xp: false,
    does: 'First-run handshake: returns agent_id and scopes for the sk_agent_ token.',
    honesty: 'Token class can never hold marketplace.mutate. Fingerprint binds on first use.',
  },
  {
    step: 'work',
    id: 'connector_emit',
    method: 'POST',
    path: '/api/gsp/connector/emit',
    credential: 'sk_agent',
    writes_state: true,
    moves_xp: false,
    does: 'Emit a connector event; returns a GSP receipt and passport_url.',
    honesty: 'Telemetry receipt, not a settlement.',
  },
  {
    step: 'work',
    id: 'arena_entry',
    method: 'POST',
    path: '/api/harness/arena/entry',
    credential: 'sk_agent',
    writes_state: true,
    moves_xp: false,
    does: 'Submit an external run to the harness arena; scored and ranked.',
    honesty: 'Arena rank is not a LICENSE.',
  },
  {
    step: 'pay',
    id: 'paid_tool_run',
    method: 'POST',
    path: '/api/a2a/run',
    credential: 'payment',
    writes_state: true,
    moves_xp: false,
    does: 'Run a paid tool; answers 402 with payment rails until paid, then result + receipt.',
    honesty: 'Rails: x402, Stripe, Telegram Stars.',
  },
  {
    step: 'pay',
    id: 'pay_link',
    method: 'POST',
    path: '/api/a2a/pay-link',
    credential: 'none',
    writes_state: false,
    moves_xp: false,
    does: 'Signed one-hour link a human can open to pay for a tool call.',
    honesty: 'Link only; payment settles on the rail.',
  },
  {
    step: 'settle',
    id: 'external_settlement',
    method: 'POST',
    path: '/api/settlement/external',
    credential: 'sk_ext',
    writes_state: true,
    moves_xp: true,
    does: 'Settle an outcome: marketplace job + valuation spine + passport receipt. external_ref is idempotent.',
    honesty: 'Same settlement plane as internal jobs. Not a hardware TEE, not statutory books.',
  },
  {
    step: 'settle',
    id: 'verified_settlement',
    method: 'POST',
    path: '/api/settlement/verified',
    credential: 'none',
    writes_state: true,
    moves_xp: false,
    does: 'Submit the published portable-audit file. The host settles once when the offline verifier accepts it and the bundle hash is the published rule.',
    honesty: 'No key. 0 XP. One idempotent row. Epoch stays UNVERIFIED. Any other bundle is refused.',
  },
  {
    step: 'prove',
    id: 'proof_verify',
    method: 'GET',
    path: '/api/proof/verify',
    credential: 'none',
    writes_state: false,
    moves_xp: false,
    does: 'Verify a portable proof by proof_hash (any mirror).',
    honesty: 'Evidence, not certification.',
  },
];

export const OUTSIDE_AGENT_CREDENTIALS: Record<Exclude<OutsideAgentCredential, 'none'>, string> = {
  sk_agent:
    'Authorization: Bearer sk_agent_… — identity token minted by the owning tenant; scopes canon.read, telemetry.write, marketplace.read, connector.emit.',
  sk_ext:
    'Authorization: Bearer sk_ext_… — per-tenant settlement key, provisioned per partner; raw key shown once.',
  payment: 'Payment proof header for the 402 rail named in the challenge.',
};

export type OutsideAgentPlatformStatus = 'ready' | 'UNVERIFIED';

export interface OutsideAgentPlatformNote {
  id: 'dots' | 'grok_bot' | 'muse';
  name: string;
  status: OutsideAgentPlatformStatus;
  install: string;
  credential: OutsideAgentCredential | 'none';
}

/** How an outside personal agent attaches. Apex host only. */
export const OUTSIDE_AGENT_PLATFORMS: readonly OutsideAgentPlatformNote[] = [
  {
    id: 'dots',
    name: 'OpenAI Dots / Agents API',
    status: 'ready',
    install: 'Add https://skenai.net/api/mcp as a remote MCP server. tools/list is open. Mutating tools/call needs a membrane session or Bearer.',
    credential: 'none',
  },
  {
    id: 'grok_bot',
    name: 'Grok Bot',
    status: 'ready',
    install: 'Store a tenant-minted sk_agent_ token. Walk GET https://skenai.net/api/a2a. Same pattern as the SKENAI Ledger / Dr Legal desk agents.',
    credential: 'sk_agent',
  },
  {
    id: 'muse',
    name: 'Meta Muse',
    status: 'UNVERIFIED',
    install: 'HTTP only until Muse tool-call surface is confirmed. Discover GET https://skenai.net/api/a2a; identify GET https://skenai.net/api/membrane/agent-token/verify with Bearer sk_agent_.',
    credential: 'sk_agent',
  },
];

export function outsideAgentChainUrl(step: OutsideAgentStep): string {
  return `${OUTSIDE_AGENT_CHAIN_HOST}${step.path}`;
}

export function buildOutsideAgentChain() {
  return {
    contract: OUTSIDE_AGENT_CHAIN_CONTRACT,
    host: OUTSIDE_AGENT_CHAIN_HOST,
    order: ['discover', 'identify', 'work', 'pay', 'settle', 'prove'] as OutsideAgentStepKind[],
    steps: OUTSIDE_AGENT_CHAIN.map((s) => ({ ...s, url: outsideAgentChainUrl(s) })),
    credentials: OUTSIDE_AGENT_CREDENTIALS,
    obtain_credentials: `${OUTSIDE_AGENT_CHAIN_HOST}/api/auth/keys`,
    platforms: OUTSIDE_AGENT_PLATFORMS,
    trajectory: {
      contract: AWI_CONTRACT,
      header: AWI_HEADER,
      settle_bind_action: AWI_SETTLE_BIND_ACTION,
      note: 'Correlation key, not auth. Send it on every step.',
    },
  };
}
