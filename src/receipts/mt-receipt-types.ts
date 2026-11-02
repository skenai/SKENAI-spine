/**
 * Merge-trajectory RECEIPT types — evidence, not adjudication (D6, 2026-11-02).
 *
 * Spine-shippable slice of mt-contract: the vocabulary a third party needs to
 * READ a merge-trajectory stamp on a receipt. The admission table, step→stage
 * map, projector, and merge gate stay CLOSED in src/lib/merge-trajectory/.
 * Contract: skenai.merge_trajectory.v0
 * Pure: no `@/` imports, no I/O.
 */

export const MT_CONTRACT = 'skenai.merge_trajectory.v0' as const;

export const MT_TRAJECTORY_RE =
  /^amt_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const MT_STAGES = ['dispatch', 'implement', 'verify', 'settle'] as const;
export type MtStage = (typeof MT_STAGES)[number];

export const MT_OUTCOMES = [
  'completed',
  'denied',
  'failed',
  'replayed',
  'held',
  'dry_run',
] as const;
export type MtOutcome = (typeof MT_OUTCOMES)[number];

export const MT_ACTOR_KINDS = [
  'architect',
  'coordinator',
  'session_agent',
  'cloud_agent',
  'mason',
  'mover_agent',
  'repair_agent',
  'verifier',
  'gate',
  'webhook',
  'platform',
] as const;
export type MtActorKind = (typeof MT_ACTOR_KINDS)[number];

export interface MtActor {
  kind: MtActorKind;
  subject: string | null;
  scope: string | null;
}

export type MergeTopology =
  | 'solo'
  | 'parallel_worktree'
  | 'implement_verify_loop'
  | 'verifier_quorum';

export type MergeClass = 'trivial' | 'reviewed' | 'guarded';

export interface MtStamp {
  contract: typeof MT_CONTRACT;
  trajectory_id: string;
  stage: MtStage;
  step_id: string;
  outcome: MtOutcome;
  actor: MtActor;
  at: string;
  repo?: string;
  pr_number?: number;
  head_branch?: string;
  head_sha?: string;
  merge_commit_sha?: string;
  job_id?: string;
  topology?: MergeTopology;
  merge_class?: MergeClass;
  evaluator?: string;
  verdict?: string;
  reason?: string;
  dispatch_stage?: 'direct' | 'job';
  implement_observed?: 'late';
  merge_method?: string;
}
