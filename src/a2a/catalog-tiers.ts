/**
 * A2A public-rail tiers. Derived from tickers, shoes, and DR adapters.
 * Excluded shoes never appear on MCP, OpenAPI, or the agent card.
 */
import { ECONOMICAL_TARGETS, type TargetStatus } from '../shoes/economical-targets-catalog.js';
import { TICKER_TO_SHOE } from '../shoes/ticker-shoe-map.js';
import type { VerticalShoeId } from '../shoes/vertical-shoes.js';

export const A2A_EXCLUDED_SHOES = ['shbk', 'propfi'] as const;

const EXCLUDED_TICKER_STATUS: TargetStatus[] = ['private', 'owned', 'counsel', 'narrative'];

export type A2aTier = 'T1' | 'T2' | 'T3';

export type CatalogTierRow = {
  tier: A2aTier | 'excluded';
  id: string;
  shoe_id: string | null;
  reason: string;
};

export function excludedShoeIds(): Set<string> {
  const out = new Set<string>(A2A_EXCLUDED_SHOES);
  for (const target of ECONOMICAL_TARGETS) {
    if (!EXCLUDED_TICKER_STATUS.includes(target.status)) continue;
    const shoe = TICKER_TO_SHOE[target.symbol];
    if (shoe) out.add(shoe);
  }
  return out;
}

/** Active-ticker shoes that are allowed as dr_brief arguments. */
export function t3ShoeIds(): VerticalShoeId[] {
  const banned = excludedShoeIds();
  const ids: VerticalShoeId[] = [];
  for (const target of ECONOMICAL_TARGETS) {
    if (target.status !== 'active') continue;
    const shoe = TICKER_TO_SHOE[target.symbol];
    if (!shoe || banned.has(shoe)) continue;
    ids.push(shoe);
  }
  return ids;
}

export function catalogTierTable(): CatalogTierRow[] {
  const rows: CatalogTierRow[] = [
    { tier: 'T1', id: 'screen_counterparty', shoe_id: 'kycx', reason: 'POST /api/compliance/counterparty' },
    { tier: 'T1', id: 'classify_item', shoe_id: 'ratio', reason: 'POST /api/compliance' },
    { tier: 'T1', id: 'compliance_batch', shoe_id: 'ratio', reason: 'POST /api/compliance/batch' },
    { tier: 'T2', id: 'legal_compliance_brief', shoe_id: 'legal', reason: 'dr.legal' },
    { tier: 'T2', id: 'osint_docket', shoe_id: 'osint', reason: 'dr.geo' },
    { tier: 'T2', id: 'botmarket_dossier', shoe_id: null, reason: 'dr.botmarket' },
    { tier: 'T2', id: 'protection_dossier', shoe_id: 'nexpert', reason: 'dr.geezers' },
    { tier: 'T2', id: 'priced_verdict', shoe_id: null, reason: 'dr.verdict' },
    { tier: 'T2', id: 'build_plan', shoe_id: 'build-plan', reason: 'dr.build_plan' },
    { tier: 'T3', id: 'dr_brief', shoe_id: null, reason: 'dr.generic over active shoes' },
  ];
  for (const shoe of excludedShoeIds()) {
    rows.push({ tier: 'excluded', id: shoe, shoe_id: shoe, reason: 'ticker status or brand law' });
  }
  return rows;
}
