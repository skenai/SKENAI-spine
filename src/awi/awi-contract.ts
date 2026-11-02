/**
 * AWI contract — constants, types, admission table.
 * Contract: skenai.awi.v0 (SPEC-AWI-V0 rev 4, grenade
 * START-AG-awi-trajectory-binding-20261006).
 * Generator-safe: no `@/` imports, no I/O.
 *
 * Spine note: this is the published subset of the engine's awi-contract.
 * Host-internal actor kinds (engine session primitives) are omitted from
 * AwiActorKind — the published union names only credentials an outside
 * caller can hold.
 */

export const AWI_CONTRACT = 'skenai.awi.v0' as const;
export const AWI_HEADER = 'x-skenai-trajectory' as const;
export const AWI_SETTLE_BIND_ACTION = 'awi_settle_bind' as const;
export const AWI_TRAJECTORY_RE =
  /^awt_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const AWI_LOAD_CAP = 200;

export type AwiStage = 'work' | 'pay' | 'settle';
export type AwiOutcome = 'completed' | 'denied' | 'failed' | 'replayed';
export type AwiActorKind =
  | 'sk_agent'
  | 'sk_ext'
  | 'prepaid_bearer'
  | 'platform'
  | 'keyless'
  | 'anonymous';

export interface AwiActor {
  kind: AwiActorKind;
  subject: string | null;
  scope: string | null;
}

export interface AwiStamp {
  contract: typeof AWI_CONTRACT;
  trajectory_id: string;
  stage: AwiStage;
  step_id: string;
  outcome: AwiOutcome;
  actor: AwiActor;
  payment?: { rail: 'x402' | 'prepaid'; payee: string | null };
  minted: boolean;
  at: string;
}

export type AwiJobSnapshot =
  | { read: 'skipped' }
  | { read: 'error'; observed_at: string }
  | { read: 'absent'; observed_at: string }
  | {
      read: 'ok';
      observed_at: string;
      status: string | null;
      settlement_state: string | null;
      settlement_event_present: boolean;
      finalized: boolean;
    };

/** Settle is satisfied only by an observed settled row — never by request outcome. */
export function isSettled(job: AwiJobSnapshot): boolean {
  return job.read === 'ok' && job.status === 'completed' && job.settlement_state === 'settled';
}

/** The only (step_id, WAL action_type, outcome) combinations the projector admits. */
export const AWI_ADMISSIONS: ReadonlyArray<{
  step_id: string;
  action_type: string;
  outcome: AwiOutcome;
}> = [
  { step_id: 'connector_emit', action_type: 'gsp_connector_receipt_emit', outcome: 'completed' },
  { step_id: 'arena_entry', action_type: 'gsp_connector_receipt_emit', outcome: 'completed' },
  { step_id: 'arena_entry', action_type: 'gsp_connector_receipt_emit', outcome: 'failed' },
  { step_id: 'paid_tool_run', action_type: 'a2a_payment_required', outcome: 'denied' },
  { step_id: 'paid_tool_run', action_type: 'a2a_paid_call', outcome: 'completed' },
  { step_id: 'external_settlement', action_type: AWI_SETTLE_BIND_ACTION, outcome: 'completed' },
  { step_id: 'external_settlement', action_type: AWI_SETTLE_BIND_ACTION, outcome: 'failed' },
  { step_id: 'external_settlement', action_type: AWI_SETTLE_BIND_ACTION, outcome: 'replayed' },
  { step_id: 'verified_settlement', action_type: AWI_SETTLE_BIND_ACTION, outcome: 'completed' },
  { step_id: 'verified_settlement', action_type: AWI_SETTLE_BIND_ACTION, outcome: 'failed' },
  { step_id: 'verified_settlement', action_type: AWI_SETTLE_BIND_ACTION, outcome: 'replayed' },
];

export function isAdmittedCombo(
  step_id: string,
  action_type: string,
  outcome: string,
): boolean {
  return AWI_ADMISSIONS.some(
    (a) => a.step_id === step_id && a.action_type === action_type && a.outcome === outcome,
  );
}
