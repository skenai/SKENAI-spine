/**
 * Membrane boundary-event types — shape only.
 *
 * Spine-shippable event vocabulary for the Lane B `membrane_boundary_log`.
 * The writer (`logMembraneEvent`, fail-closed engine-side append) stays CLOSED in
 * src/lib/membrane/audit.ts, which imports these types — one source of truth.
 * Pure types — no imports, no I/O.
 */

export type MembraneEventType = 'ADMIT' | 'DENY' | 'SETTLE' | 'VIOLATION';

export interface MembraneAuditParams {
  /** The SPAN address of the agent crossing the boundary */
  span_address: string;

  /** The lifecycle event being recorded */
  event_type: MembraneEventType;

  /** Network provenance — IPv4/IPv6 of the request originator */
  ip_address?: string | null;

  /** SHA-256 fingerprint of the executing skill bundle */
  skill_hash?: string | null;

  /** Structured scope payload (e.g. { scopes: ['canon.read'] }) */
  scope?: Record<string, unknown> | null;

  /** Links ADMIT → SETTLE pairs for a single agent lifecycle */
  session_id?: string | null;

  /** Arbitrary structured context (denial reason, violation details, etc.) */
  metadata?: Record<string, unknown> | null;
}
