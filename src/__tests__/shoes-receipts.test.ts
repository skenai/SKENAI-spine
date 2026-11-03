import { describe, it, expect } from 'vitest';
import {
  PUBLIC_VERTICAL_SHOES,
  VERTICAL_SHOES,
  listPublicVerticalShoes,
  getVerticalShoe,
} from '../shoes/vertical-shoes.js';
import { PUBLIC_VERTICAL_SHOE_IDS } from '../shoes/vertical-shoes-public.js';
import { TICKER_TO_SHOE, shoeIdForTicker } from '../shoes/ticker-shoe-map.js';
import { ECONOMICAL_TARGETS, listPublicEconomicalTargets } from '../shoes/economical-targets-catalog.js';
import { MT_CONTRACT, MT_STAGES, MT_TRAJECTORY_RE, type MtStamp } from '../receipts/mt-receipt-types.js';
import type { OssPrMembraneReceiptInput } from '../receipts/oss-pr-receipt-shape.js';
import type { MembraneAuditParams } from '../receipts/membrane-event-types.js';

const FORBIDDEN = new Set([
  'kadita', 'akita', 'boker', 'arbor', 'tenant_connector', 'askenai',
  'dxc', 'sopra', 'sabel', 'shadow', 'alberta', 'nexpert',
  'iprd', 'herd', 'nxprt', 'pshdw', 'bob7k',
]);
const FORBIDDEN_TICKERS = new Set([
  'KADITA', 'AKITA', 'BOKER', 'ARBOR', 'TCONN', 'ASKN', 'DXC',
  'ALBTA', 'SOPRA', 'BOB7K', 'NXPRT', 'HERD', 'IPRD', 'SABEL', 'PSHDW', 'SOCKS',
]);

describe('shoe catalog — public perimeter', () => {
  it('contains only public shoes (no architect-private ids)', () => {
    expect(VERTICAL_SHOES.length).toBeGreaterThan(50);
    for (const shoe of VERTICAL_SHOES) {
      expect(FORBIDDEN.has(shoe.id)).toBe(false);
      expect(shoe.membrane_class).not.toBe('architect_private');
    }
    for (const id of PUBLIC_VERTICAL_SHOE_IDS) expect(FORBIDDEN.has(id)).toBe(false);
    const publicShoes = listPublicVerticalShoes();
    for (const shoe of publicShoes) {
      expect(FORBIDDEN.has(shoe.id)).toBe(false);
      expect(shoe.membrane_class).not.toBe('architect_private');
      expect(shoe.catalog_visibility).not.toBe('lab');
      expect(shoe.landing_path).toBeTruthy();
    }
    // Lab-visibility shoes exist in the catalog but stay off the public list.
    expect(publicShoes.length).toBeLessThan(VERTICAL_SHOES.length);
  });
  it('ticker map resolves public tickers only', () => {
    for (const t of Object.keys(TICKER_TO_SHOE)) expect(FORBIDDEN_TICKERS.has(t)).toBe(false);
    expect(shoeIdForTicker('REG')).toBe('registry');
    expect(shoeIdForTicker('KADITA')).toBeNull();
    expect(shoeIdForTicker('DXC')).toBeNull();
  });
  it('econ targets carry no private-status rows', () => {
    for (const t of ECONOMICAL_TARGETS) expect(t.status).not.toBe('private');
    for (const t of ECONOMICAL_TARGETS) {
      expect(['PLNV', 'VIA', 'NEBIUS', 'ENDPT', 'SUNGRID', 'AUKERA', 'BOB7K', 'HERD', 'IPRD', 'SABEL', 'NXPRT', 'PSHDW', 'SOCKS']).not.toContain(t.symbol);
    }
    expect(listPublicEconomicalTargets().length).toBe(ECONOMICAL_TARGETS.length);
  });
});

describe('receipt shapes — evidence not adjudication', () => {
  it('mt stamp contract id + stage/outcome vocab', () => {
    expect(MT_CONTRACT).toBe('skenai.merge_trajectory.v0');
    expect(MT_STAGES).toEqual(['dispatch', 'implement', 'verify', 'settle']);
    const stamp: MtStamp = {
      contract: MT_CONTRACT,
      trajectory_id: 'amt_1234abcd-1234-4abc-8def-1234567890ab',
      stage: 'settle',
      step_id: 'merge_bind',
      outcome: 'completed',
      actor: { kind: 'gate', subject: null, scope: null },
      at: new Date().toISOString(),
    };
    expect(MT_TRAJECTORY_RE.test(stamp.trajectory_id)).toBe(true);
  });
  it('oss pr receipt input shape', () => {
    const input: OssPrMembraneReceiptInput = { action: 'pr_merged', repo: 'skenai-spine', prNumber: 1, prUrl: 'https://github.com/x/pull/1' };
    expect(input.action).toBe('pr_merged');
  });
  it('membrane event params shape', () => {
    const p: MembraneAuditParams = { span_address: 'span://v1/x', event_type: 'SETTLE' };
    expect(p.event_type).toBe('SETTLE');
  });
});
