/**
 * @skenai/spine — the published interface layer of the SKENAI settlement
 * network. Contracts, schemas, receipt shapes, and SPAN helpers only.
 * No settlement engine internals; no I/O; no environment access.
 */

// SPAN helpers — address scheme for crystallized objects.
export * from './span/signal-span.js';

// Agent-webhook interchange (AWI) — trajectory correlation contract.
export * from './awi/awi-contract.js';

// A2A — the ordered outside-agent chain and the x402 payment rail.
export * from './a2a/outside-agent-chain.js';
export * from './a2a/x402.js';
export * from './a2a/tenant-connector-contract.js';

// Ingress — membrane channel registry and the identity-bridge protocol.
export * from './ingress/agent-ingress-channels.js';
export * from './ingress/naked-protocol.js';

// OSS dogfood — governed PR patch shape for the public perimeter.
export * from './oss/wire3-dogfood.js';
