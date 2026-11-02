#!/usr/bin/env node
/**
 * Spine reduction of the skenai-net A2A-T2a drift check.
 *
 * Syncs the `outside_agent_chain` block of contracts/agents.json from the
 * built package. Run `npm run build` first (this imports dist/).
 *
 * Upstream, this script also imports SALEOS_OPEN_MCP_TOOLS
 * (src/lib/saleos/mcp-tools.ts) and BUYER_FUNNEL_CONTRACT
 * (src/lib/network/aeo-discoverability.ts) and rewrites mcp.json and
 * agent-card.json — engine-lane concerns that do not ship in the spine.
 * Only the outside-agent-chain block is regenerated here; the rest of
 * contracts/agents.json is the verbatim published document.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOutsideAgentChain } from '../dist/a2a/outside-agent-chain.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const agentsPath = join(root, 'contracts', 'agents.json');

const agents = JSON.parse(readFileSync(agentsPath, 'utf8'));

const chain = buildOutsideAgentChain();
const chainEntry = `${chain.host}/api/a2a`;
agents.outside_agent_chain = {
  contract: chain.contract,
  entry: chainEntry,
  order: chain.order,
  steps: chain.steps.map(({ step, id, method, url, credential, moves_xp }) => ({
    step,
    id,
    method,
    url,
    credential,
    moves_xp,
  })),
  credentials: chain.credentials,
  obtain_credentials: chain.obtain_credentials,
  platforms: chain.platforms,
  trajectory: chain.trajectory,
};
agents.generated_at = new Date().toISOString();

writeFileSync(agentsPath, `${JSON.stringify(agents, null, 2)}\n`);

console.log(
  JSON.stringify({
    ok: true,
    outside_agent_chain_steps: chain.steps.length,
  }),
);
