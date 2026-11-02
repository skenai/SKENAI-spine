/**
 * Agent Ingress Membrane v1 — channel registry.
 * Naked is the membrane. OpenClaw is one legacy adapter id.
 * T1 operator runs must not be written as economic ADMIT/SETTLE.
 */
export const AGENT_INGRESS_MEMBRANE_CONTRACT = 'skenai.agent_ingress_membrane.v1' as const;

export type IngressKind = 'compute' | 'human' | 'vendor';
export type IngressTier = 'T0_observe' | 'T1_operate' | 'T2_economic';

export type IngressChannelId =
  | 'mcp_session'
  | 'cursor_cloud'
  | 'oss_pr'
  | 'mcp_qualify'
  | 'grokbot_radar'
  | 'telegram_identity'
  | 'telegram_bot'
  | 'marketplace_award'
  | 'contributor_ingress'
  | 'vendor_8090'
  | 'interior_trusted'
  | 'openclaw_legacy';

export interface IngressChannelDef {
  id: IngressChannelId;
  kind: IngressKind;
  tier: IngressTier | null;
  requiresEscrow: boolean;
  wired: boolean;
  publicLabel: string;
}

const SBL_SESSION = 'SBL governed session';

export const INGRESS_CHANNELS: Record<IngressChannelId, IngressChannelDef> = {
  mcp_session: {
    id: 'mcp_session',
    kind: 'compute',
    tier: 'T2_economic',
    requiresEscrow: true,
    wired: true,
    publicLabel: SBL_SESSION,
  },
  cursor_cloud: {
    id: 'cursor_cloud',
    kind: 'compute',
    tier: 'T1_operate',
    requiresEscrow: false,
    wired: true,
    publicLabel: 'operator cloud session',
  },
  oss_pr: {
    id: 'oss_pr',
    kind: 'compute',
    tier: 'T1_operate',
    requiresEscrow: false,
    wired: true,
    publicLabel: 'OPEN-perimeter PR receipt',
  },
  mcp_qualify: {
    id: 'mcp_qualify',
    kind: 'compute',
    tier: 'T0_observe',
    requiresEscrow: false,
    wired: false,
    publicLabel: 'observe only',
  },
  grokbot_radar: {
    id: 'grokbot_radar',
    kind: 'compute',
    tier: 'T0_observe',
    requiresEscrow: false,
    wired: false,
    publicLabel: 'observe only',
  },
  telegram_identity: {
    id: 'telegram_identity',
    kind: 'human',
    tier: null,
    requiresEscrow: false,
    wired: false,
    publicLabel: 'identity membrane',
  },
  telegram_bot: {
    id: 'telegram_bot',
    kind: 'compute',
    tier: 'T0_observe',
    requiresEscrow: false,
    wired: false,
    publicLabel: 'observe only',
  },
  marketplace_award: {
    id: 'marketplace_award',
    kind: 'compute',
    tier: 'T2_economic',
    requiresEscrow: true,
    wired: true,
    publicLabel: SBL_SESSION,
  },
  contributor_ingress: {
    id: 'contributor_ingress',
    kind: 'compute',
    tier: 'T2_economic',
    requiresEscrow: true,
    wired: false,
    publicLabel: SBL_SESSION,
  },
  vendor_8090: {
    id: 'vendor_8090',
    kind: 'vendor',
    tier: 'T0_observe',
    requiresEscrow: false,
    wired: false,
    publicLabel: 'observe only',
  },
  interior_trusted: {
    id: 'interior_trusted',
    kind: 'compute',
    tier: 'T1_operate',
    requiresEscrow: false,
    wired: false,
    publicLabel: 'operator session',
  },
  openclaw_legacy: {
    id: 'openclaw_legacy',
    kind: 'compute',
    tier: 'T2_economic',
    requiresEscrow: true,
    wired: false,
    publicLabel: SBL_SESSION,
  },
};

export const INGRESS_CHANNEL_IDS = Object.keys(INGRESS_CHANNELS) as IngressChannelId[];

/** Files that must contain withIngressStamp(..., '<id>') for each wired channel. */
export const WIRED_STAMP_SITES: { id: IngressChannelId; files: string[] }[] = [
  {
    id: 'mcp_session',
    files: [
      'src/app/api/membrane/onboard/route.ts',
      'src/app/api/membrane/offboard/route.ts',
      'src/app/api/mcp/route.ts',
    ],
  },
  {
    id: 'cursor_cloud',
    files: ['src/lib/agent-mover/spine-receipt.ts'],
  },
  {
    id: 'oss_pr',
    files: ['src/lib/oss/pr-membrane-receipt.ts'],
  },
  {
    id: 'marketplace_award',
    files: ['src/lib/marketplace/award-job.ts', 'src/app/api/marketplace/award/route.ts'],
  },
];

export function getIngressChannel(id: IngressChannelId): IngressChannelDef {
  const row = INGRESS_CHANNELS[id];
  if (!row) {
    throw new Error(`[aim] unknown ingress channel: ${String(id)}`);
  }
  return row;
}

export function assertEscrowPolicy(id: IngressChannelId, hasEscrowLock: boolean): void {
  const row = getIngressChannel(id);
  if (row.kind === 'human' && hasEscrowLock) {
    throw new Error(`[aim] human channel ${id} must not present escrow as admission`);
  }
  if (row.requiresEscrow && !hasEscrowLock) {
    throw new Error(`[aim] T2 channel ${id} requires escrow lock`);
  }
  if (!row.requiresEscrow && hasEscrowLock) {
    throw new Error(`[aim] ${id} must not present escrow as economic admission`);
  }
}

export function ingressAuditMetadata(id: IngressChannelId): {
  contract: typeof AGENT_INGRESS_MEMBRANE_CONTRACT;
  ingress_channel: IngressChannelId;
  ingress_kind: IngressKind;
  ingress_tier: IngressTier | null;
  ingress_wired: boolean;
} {
  const row = getIngressChannel(id);
  return {
    contract: AGENT_INGRESS_MEMBRANE_CONTRACT,
    ingress_channel: row.id,
    ingress_kind: row.kind,
    ingress_tier: row.tier,
    ingress_wired: row.wired,
  };
}

export function withIngressStamp<T extends Record<string, unknown>>(
  extra: T,
  id: IngressChannelId,
): T & ReturnType<typeof ingressAuditMetadata> {
  return { ...extra, ...ingressAuditMetadata(id) };
}
