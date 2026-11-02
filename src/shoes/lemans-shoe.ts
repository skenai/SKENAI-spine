/**
 * Le Mans whale shoe — parametric kernel for endurance motorsport vertical.
 * First Whale Ticker slot: 24h proof density, not lap hype.
 *
 * Canon: SKENAI-RS .../artifacts/LEMANS-WHALE-SHOE-2026-07-18.md
 * Sources: Wikipedia 24 Hours of Le Mans · lemans.racing (FIA WEC)
 */

export const LEMANS_SHOE_ID = 'lemans' as const

export type LemansParametricKernel = {
  shoe_id: typeof LEMANS_SHOE_ID
  symbol: 'LEMANS'
  billboard: 'LEMANS BY wiLLiaM'
  door: 'D3'
  market: 'M2'
  beats: Array<'gate' | 'settle' | 'prove'>
  span: string
  /** Endurance = terminal events over 24h window, not peak lap */
  proof_model: 'endurance_receipt_density'
  qualify_href: string
  /** Mock endurance HQ — every UI action = GSP tx */
  mock_href: string
  william_lane: 'wow_dispatch'
  epoch_status: 'UNVERIFIED'
  membrane_class: 'sandbox'
  parameters: {
    race: '24 Hours of Le Mans'
    series: 'FIA WEC'
    duration_hours: 24
    /** Garage 56 = innovation entry — maps to parametric experiment lane */
    garage_56: boolean
    /** Classify → crystallize → Passport per stint / pit / regulation beat */
    receipt_granularity: 'stint' | 'pit' | 'regulation' | 'coverage'
  }
  thesis: string
  outward_claims: string
}

export const LEMANS_PARAMETRIC_KERNEL: LemansParametricKernel = {
  shoe_id: LEMANS_SHOE_ID,
  symbol: 'LEMANS',
  billboard: 'LEMANS BY wiLLiaM',
  door: 'D3',
  market: 'M2',
  beats: ['gate', 'settle', 'prove'],
  span: 'span://v1/skenai/whale/lemans',
  proof_model: 'endurance_receipt_density',
  qualify_href: '/gsp?door=D3&ref=lemans',
  mock_href: '/lemans',
  william_lane: 'wow_dispatch',
  epoch_status: 'UNVERIFIED',
  membrane_class: 'sandbox',
  parameters: {
    race: '24 Hours of Le Mans',
    series: 'FIA WEC',
    duration_hours: 24,
    garage_56: true,
    receipt_granularity: 'stint',
  },
  thesis:
    'Endurance is parametric settlement — 24 hours of terminal proofs beats one hot lap. Fractal: every website action collapses to a GSP transaction ranked by BMI risk × value.',
  outward_claims:
    'Category positioning only — not affiliated with ACO/FIA/WEC until partner close. UNVERIFIED sandbox membrane.',
}

export function lemansQualifyDoorHint(): string {
  return LEMANS_SHOE_ID
}
