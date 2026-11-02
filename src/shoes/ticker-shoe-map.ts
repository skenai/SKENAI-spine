/**
 * Economical ticker symbol → vertical shoe id (printer join).
 * Every ECONOMICAL_TARGETS symbol must resolve for shell batch + OSR demand.
 * Contract: skenai.ticker_shoe_map.v0.1
 */
import type { VerticalShoeId } from './vertical-shoes.js'
import { ECONOMICAL_TARGETS } from './economical-targets-catalog.js'
import { getVerticalShoe } from './vertical-shoes.js'

export const TICKER_SHOE_MAP_CONTRACT = 'skenai.ticker_shoe_map.v0.1' as const

/** Explicit map — REG→registry, others lowercase ticker→shoe when 1:1. */
export const TICKER_TO_SHOE: Record<string, VerticalShoeId> = {
  REG: 'registry',
  OSINT: 'osint',
  CVE: 'cve',
  LEMANS: 'lemans',
  SUNO: 'suno',
  GOVREL: 'govrel',
  ENRG: 'energy',
  AGRO: 'agroenergy',
  MFG: 'manufacturing',
  MATL: 'materials',
  GOALS: 'goals',
  CANON: 'canon',
  PROPFI: 'propfi',
  SALEOS: 'saleos',
  ART: 'arthouse',
  AUDIT: 'audit',
  SOVAI: 'sovai',
  '8090': '8090',
  ACCT: 'acct',
  DJAY: 'djay',
  NWRK: 'nwrk',
  NXT: 'nxt',
  NWOR: 'nwor',
  RATIO: 'ratio',
  SWPR: 'swpr',
  SHBK: 'shbk',
  ABNB: 'abnb',
  QBOK: 'qbok',
  STRK: 'strk',
  VALD: 'vald',
  KREAB: 'kreab',
  GTP: 'gtp',
  PSKY: 'psky',
  PLNV: 'planven',
  CARNET: 'carnet',
  VIA: 'via',
  MEDIA: 'media',
  CNTR: 'cntr',
  BIZKIT: 'bizkit',
  ORGSK: 'orgsk',
  VULCAN: 'vulcan',
  IPRD: 'iprd',
  NEBIUS: 'nebius',
  VICT: 'victron',
  AIVIS: 'aivis',
  ENDPT: 'endpt',
  SKENET: 'skenet',
  WRLDM: 'world-models',
  HFHB: 'huggingface',
  ILLIA: 'illia',
  OPMESH: 'opmesh',
  KYCX: 'kycx',
  TELEM: 'telem',
  SUNGRID: 'sungrid',
  AUKERA: 'aukera',
  KWHA: 'kwh',
  FININF: 'fininfra',
  HERD: 'livestock',
  LBO: 'restructure',
  LYAP: 'lyap',
  HOPR: 'hopper',
  ILAI: 'israelai',
  NAIS: 'natlai',
  GCCAI: 'gccai',
  GARCH: 'garch',
  ENGINT: 'engagement-intelligence',
  FIVESTORE: 'fivestore',
  STGOV: 'stategov',
  COTE: 'cot_edu',
  LLM911: 'llm911',
  IYETI: 'importyeti',
  OMCH: 'omarchy',
  IACA: 'canarchive',
  LGCY: 'legacy_audit',
  UTREE: 'unitree',
  SKOP: 'skenopera',
  LEGAL: 'legal',
  DECKB: 'deck_bundle',
}



export function shoeIdForTicker(symbol: string): VerticalShoeId | null {
  const key = symbol.trim().toUpperCase()
  return TICKER_TO_SHOE[key] ?? null
}

export function listTickerShoePairs(): Array<{
  symbol: string
  shoe_id: VerticalShoeId
  shoe_ok: boolean
  target_name: string
}> {
  return ECONOMICAL_TARGETS.filter((t) => t.status !== 'private').map((t) => {
    const shoe_id = shoeIdForTicker(t.symbol)
    return {
      symbol: t.symbol,
      shoe_id: (shoe_id ?? 'web') as VerticalShoeId,
      shoe_ok: Boolean(shoe_id && getVerticalShoe(shoe_id)),
      target_name: t.name,
    }
  })
}

/** Fail-closed audit — every public ticker must have an admitted shoe. */
export function auditTickerShoeCoverage(): {
  ok: boolean
  missing: string[]
  count: number
  contract_ref: typeof TICKER_SHOE_MAP_CONTRACT
} {
  const publicTargets = ECONOMICAL_TARGETS.filter((t) => t.status !== 'private')
  const missing = publicTargets.filter((t) => {
    const id = shoeIdForTicker(t.symbol)
    return !id || !getVerticalShoe(id)
  }).map((t) => t.symbol)
  return {
    ok: missing.length === 0,
    missing,
    count: publicTargets.length,
    contract_ref: TICKER_SHOE_MAP_CONTRACT,
  }
}
