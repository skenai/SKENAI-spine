import { describe, expect, it } from 'vitest';
import {
  buildOutsideAgentChain,
  OUTSIDE_AGENT_CHAIN,
  OUTSIDE_AGENT_CHAIN_CONTRACT,
  OUTSIDE_AGENT_CHAIN_HOST,
  outsideAgentChainUrl,
} from '../a2a/outside-agent-chain.js';
import { AWI_CONTRACT, AWI_HEADER, AWI_SETTLE_BIND_ACTION } from '../awi/awi-contract.js';

describe('outside-agent chain', () => {
  it('publishes the contract id and host', () => {
    expect(OUTSIDE_AGENT_CHAIN_CONTRACT).toBe('skenai.outside_agent_chain.v0');
    expect(OUTSIDE_AGENT_CHAIN_HOST).toBe('https://skenai.net');
  });

  it('orders the manifest discover → identify → work → pay → settle → prove', () => {
    const chain = buildOutsideAgentChain();
    expect(chain.order).toEqual(['discover', 'identify', 'work', 'pay', 'settle', 'prove']);

    const rank = new Map(chain.order.map((kind, i) => [kind, i]));
    const ranks = chain.steps.map((s) => rank.get(s.step)!);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(new Set(ranks).size).toBe(6); // every stage is present
  });

  it('gives every step an absolute URL on the chain host', () => {
    for (const step of OUTSIDE_AGENT_CHAIN) {
      expect(outsideAgentChainUrl(step)).toBe(`${OUTSIDE_AGENT_CHAIN_HOST}${step.path}`);
      expect(step.path.startsWith('/')).toBe(true);
    }
    const ids = OUTSIDE_AGENT_CHAIN.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks only settlement-mutating steps as moves_xp', () => {
    const movers = OUTSIDE_AGENT_CHAIN.filter((s) => s.moves_xp).map((s) => s.id);
    expect(movers).toEqual(['external_settlement']);
  });

  it('attaches the AWI trajectory contract as correlation key', () => {
    const chain = buildOutsideAgentChain();
    expect(chain.trajectory).toMatchObject({
      contract: AWI_CONTRACT,
      header: AWI_HEADER,
      settle_bind_action: AWI_SETTLE_BIND_ACTION,
    });
    expect(chain.trajectory.header).toBe('x-skenai-trajectory');
  });

  it('names the credential classes and how to obtain them', () => {
    const chain = buildOutsideAgentChain();
    expect(Object.keys(chain.credentials).sort()).toEqual(['payment', 'sk_agent', 'sk_ext']);
    expect(chain.obtain_credentials).toBe('https://skenai.net/api/auth/keys');
  });
});
