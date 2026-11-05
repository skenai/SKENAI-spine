# @skenai/spine

The published interface layer of the SKENAI settlement network.

Spine ships the **contracts, schemas, receipt *shapes*, and SPAN helpers** an
outside tenant needs to build a surface that settles back on the canonical
SKENAI ledger — and to verify receipts **offline**. It is pure schema and
helpers: no I/O, no environment access, no engine internals.

## What it is

- **SPAN helpers** — parse/build `span://v1/skenai/...` addresses for
  crystallized objects (`src/span/`).
- **Outside-agent chain** — the one ordered path a foreign agent walks:
  `discover → identify → work → pay → settle → prove`
  (`src/a2a/outside-agent-chain.ts`), plus the machine-readable card at
  `contracts/agents.json`.
- **x402 payment rail** — `PaymentRequired` challenge shape, header
  encode/decode, payload digest, and a pluggable `Facilitator` interface
  (`src/a2a/x402.ts`). Configuration is passed in as parameters — the spine
  reads no `process.env`.
- **Tenant connector contract** — the published connector source list and
  PIIE classes (`src/a2a/tenant-connector-contract.ts`).
- **AWI trajectory contract** — the correlation key carried on every chain
  step (`x-skenai-trajectory`), the admission table, and the stamp shape an
  integrator can check receipts against (`src/awi/awi-contract.ts`).
- **Ingress membrane** — the channel registry and identity-bridge protocol
  as published shapes (`src/ingress/`).
- **OSS dogfood** — the governed PR patch shape for the public perimeter
  (`src/oss/`).

## What it deliberately is NOT

The settlement **engine** is CLOSED and is never shipped through this
package. That means none of the following are here, by design:

- Merge-trajectory adjudication
- XP mint / ledger internals
- Reconcile, shadow, and tithe internals
- The persistence layer (Supabase) or any cloud SDK
- Private tenant, client, or lane identifiers

Receipts are **verify-only**: who, what, hash. A receipt lets you confirm an
event happened on the canonical ledger — it never exposes the decision trace
that produced it. If you find yourself wanting engine internals, you want a
LICENSE lane, not this package.

## Three-tier model

| Tier | What | Access |
| :--- | :--- | :--- |
| **OPEN** | This repo — contracts, schemas, receipt shapes, SPAN helpers, `contracts/agents.json` | Apache-2.0, no agreement |
| **LICENSABLE** | Surfaces and lanes that act on the network (awards, qualified ingress, compliance classify at scale) | Contract required — HILT gate, per-tenant keys (`sk_ext`) |
| **CLOSED** | Settlement engine: adjudication, mint, reconcile, tithe, persistence | Never shipped |

## Install

```bash
npm install @skenai/spine
```

## Quickstart

```ts
import {
  buildOutsideAgentChain,
  buildSignalSpan,
  parseSignalDocIdFromSpan,
  buildPaymentRequired,
  AWI_HEADER,
} from '@skenai/spine';

// The ordered manifest a foreign agent walks on skenai.net.
const chain = buildOutsideAgentChain();
console.log(chain.order); // ['discover','identify','work','pay','settle','prove']

// SPAN round-trip for a crystallized signal document.
const span = buildSignalSpan('doc_abc123'); // span://v1/skenai/signals/doc_abc123
parseSignalDocIdFromSpan(span); // 'doc_abc123'

// Build a 402 challenge for one paid tool call (config is passed in, not env).
const required = buildPaymentRequired({
  tool: 'skenai-william-compliance',
  description: 'Export-control classify',
  resourceUrl: 'https://skenai.net/api/a2a/run',
  amountUsd: 0.25,
  inputSchema: { type: 'object' },
  payTo: '0xYourSettlementAddress',
});
```

## Boundary check

`npm run check:boundary` scans `src/**` and fails the build if any file
contains engine persistence (`supabase`), cloud SDKs (`@aws-sdk`),
environment access (`process.env`), filesystem imports (`fs`/`node:fs`), or
closed client/lane terms. It runs in CI and on `prepublishOnly`. The check is
the contract that keeps this repo on the OPEN tier — see
`scripts/check-boundary.mjs`.

## Whitepaper

Protocol background and the economic argument live in the skenai.net
whitepaper archive (skenai.net/whitepaper).

## License

Apache-2.0 — see [LICENSE](LICENSE) and [NOTICE](NOTICE).
Contributions are DCO-signed — see [CONTRIBUTING.md](CONTRIBUTING.md).


## Contribution receipts

Every merged pull request produces an attributable contribution receipt on the network membrane. Contributors who link their GitHub account to a SKENAI workspace receive governed XP credit for accepted merges — see CONTRIBUTING.md for the sign-off requirements.
