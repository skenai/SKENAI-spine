/**
 * OSS PR membrane receipt — shape only (D3 split, 2026-11-02).
 *
 * The writer (`logOssPrMembraneReceipt`) stays CLOSED in src/lib/oss/; this is
 * the spine-shippable input/field vocabulary a third party needs to read the
 * receipt. Pure types — no imports, no I/O.
 */

export type OssPrMembraneAction = 'pr_opened' | 'pr_merged';

export interface OssPrMembraneReceiptInput {
  action: OssPrMembraneAction;
  repo: string;
  prNumber: number;
  prUrl: string;
  tenantSpan?: string;
  headSha?: string;
  openPaths?: string[];
  /** skenai.merge_trajectory.v0 correlation — additive metadata. */
  trajectoryId?: string;
}
