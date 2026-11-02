/**
 * Vertical shoe catalog — parametric hubs on the GSP membrane.
 * Contract: skenai.vertical_shoe.v0.1
 *
 * SPINE VARIANT: public catalog only. Private client shoes never ship —
 * the spine world has no private ids (see vertical-shoes-public.ts).
 */
import { PUBLIC_VERTICAL_SHOES, PUBLIC_VERTICAL_SHOE_IDS } from './vertical-shoes-public.js'

export const VERTICAL_SHOE_CONTRACT = 'skenai.vertical_shoe.v0.1' as const

export type VerticalShoeId = (typeof PUBLIC_VERTICAL_SHOE_IDS)[number]

export const ALL_VERTICAL_SHOE_IDS: readonly VerticalShoeId[] = PUBLIC_VERTICAL_SHOE_IDS

export type VerticalShoeMembraneClass = 'sandbox' | 'architect_private'

/** `lab` = instrument retained in git; excluded from public catalog / GTM funnel. */
export type VerticalShoeCatalogVisibility = 'public' | 'lab'

export type VerticalShoeDef = {
  id: VerticalShoeId
  sku: string
  name: string
  hub: string
  market: string
  door: string
  qualify_path: string
  risk_api: string
  /**
   * Public landing path. Empty string = never publish a public shoe page
   * (`architect_private` clients — no spectacle).
   */
  landing_path: string
  /** Public feed anchors for dogfood */
  seed_sources: string[]
  pitch: string
  epoch_status: 'UNVERIFIED'
  membrane_class: VerticalShoeMembraneClass
  /** Default public when omitted. `lab` = frozen instrument — not GTM. */
  catalog_visibility?: VerticalShoeCatalogVisibility
  /** Accounting v1 — unit economics API for shoes with L1 infra hooks */
  unit_economics_api?: string
}

export const VERTICAL_SHOES: VerticalShoeDef[] = PUBLIC_VERTICAL_SHOES

export function getVerticalShoe(id: VerticalShoeId): VerticalShoeDef | undefined {
  return VERTICAL_SHOES.find((s) => s.id === id)
}

export function listVerticalShoes(): VerticalShoeDef[] {
  return VERTICAL_SHOES
}

/** Public / searchable catalog — excludes architect_private client shoes and lab-frozen instruments. */
export function listPublicVerticalShoes(): VerticalShoeDef[] {
  return VERTICAL_SHOES.filter(
    (s) => s.membrane_class !== 'architect_private' && s.catalog_visibility !== 'lab',
  )
}

export function isLabCatalogShoe(shoe: VerticalShoeDef | undefined): boolean {
  return shoe?.catalog_visibility === 'lab'
}

export function isCatalogGtmShoe(shoe: VerticalShoeDef | undefined): boolean {
  if (!shoe) return false
  if (shoe.membrane_class === 'architect_private') return false
  if (shoe.catalog_visibility === 'lab') return false
  return Boolean(shoe.landing_path)
}

/** Dedicated /shoes/* landings that render CatalogTenantFunnel (noindex; may be architect_private). */
export function isCatalogLandingShoe(shoe: VerticalShoeDef | undefined): boolean {
  if (!shoe?.landing_path?.startsWith('/shoes/')) return false
  if (shoe.catalog_visibility === 'lab') return false
  if (shoe.id === 'tenant_connector' || shoe.id === 'askenai') return true
  return isCatalogGtmShoe(shoe)
}

export function isPublicVerticalShoe(id: VerticalShoeId): boolean {
  const def = getVerticalShoe(id)
  return isCatalogGtmShoe(def)
}

export type VerticalShoeStamp = {
  sku: string
  vertical: VerticalShoeId
  site_ref: string
  qualify_path: string
  risk_api: string
  tenant_mode: 'sandbox'
  dogfood: boolean
  ledger: 'SKENAI WAL + risk strip'
  epoch_status: 'UNVERIFIED'
  membrane_class: VerticalShoeMembraneClass
}

export function admitVerticalShoe(vertical: VerticalShoeId, siteRef?: string): VerticalShoeStamp {
  const def = getVerticalShoe(vertical)
  if (!def) throw new Error(`Unknown vertical: ${vertical}`)
  const ref = (siteRef ?? vertical).trim().toLowerCase()
  const dogfood = def.seed_sources.some((s) => s.includes(ref) || ref === vertical)
  return {
    sku: def.sku,
    vertical,
    site_ref: ref,
    qualify_path: def.qualify_path,
    risk_api: def.risk_api,
    tenant_mode: 'sandbox',
    dogfood,
    ledger: 'SKENAI WAL + risk strip',
    epoch_status: 'UNVERIFIED',
    membrane_class: def.membrane_class,
  }
}

export function verticalShoeCatalogManifest(opts?: { includePrivate?: boolean }) {
  const shoes = opts?.includePrivate ? VERTICAL_SHOES : listPublicVerticalShoes()
  return {
    contract_ref: VERTICAL_SHOE_CONTRACT,
    shoes,
    epoch_status: 'UNVERIFIED' as const,
    forbidden: [
      'Actuarial / insurance pricing without Counsel',
      'Classified or paywalled OSINT ingest',
      'Authenticated CVE vendor portals without license',
      'Public publish / search / William disclose of architect_private client shoes',
    ],
  }
}
