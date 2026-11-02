/**
 * Enter naked / leave naked — Telegram ↔ web identity membrane.
 * Protects network assets; disconnect restarts the tenant as an economic actor.
 * Compute ingress (MCP, Cursor, Grokbot) uses Agent Ingress Membrane — not this file.
 */

export const NAKED_PROTOCOL_CONTRACT = 'skenai.naked_protocol.v0.1' as const;

export function isTelegramWebLinked(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  return metadata?.telegram_linked === true;
}

export const ENTER_NAKED_COPY = {
  title: 'Enter naked',
  line: 'Binding Telegram shares your identity across WOT (Telegram) and WOW (web). One memory — one economic actor.',
  asset:
    'At higher tiers you may provision your own shoe and VPS through SKENAI. That lane assumes this bridge stays intact.',
  cta: 'Connect Telegram',
} as const;

export const LEAVE_NAKED_COPY = {
  title: 'Leave naked',
  line: 'Disconnecting severs the WOT ↔ WOW bridge. We protect network assets — your settled contributions are valued and an exit tax may apply before the bond is released.',
  restart:
    'You restart your journey as a new economic actor. Re-linking later is enter naked again — no free carry of the prior membrane state.',
  vps:
    'If you hold a provisioned shoe or VPS, breaking this connection can breach thermodynamic contract assumptions. Markets must plan for immediate liquidation contingency — UNVERIFIED until your tier is ratified.',
  confirmLabel: 'I understand leave naked — exit tax and restart apply',
  cta: 'Leave naked — disconnect Telegram',
} as const;

export function buildLeaveNakedConfirmBody(): string {
  return [
    LEAVE_NAKED_COPY.title,
    '',
    LEAVE_NAKED_COPY.line,
    '',
    LEAVE_NAKED_COPY.restart,
    '',
    LEAVE_NAKED_COPY.vps,
  ].join('\n');
}

export type LeaveNakedReceipt = {
  contract: typeof NAKED_PROTOCOL_CONTRACT;
  protocol: 'leave_naked';
  exit_tax_status: 'UNVERIFIED';
  exit_tax_notice: string;
  restart_notice: string;
};

export function buildLeaveNakedReceipt(): LeaveNakedReceipt {
  return {
    contract: NAKED_PROTOCOL_CONTRACT,
    protocol: 'leave_naked',
    exit_tax_status: 'UNVERIFIED',
    exit_tax_notice:
      'Contribution value will be calculated against settled receipts. Exit tax levy applies before membrane release — settlement math ratifies at VERIFIED epoch.',
    restart_notice: LEAVE_NAKED_COPY.restart,
  };
}
