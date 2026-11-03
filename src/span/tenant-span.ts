/**
 * OSS Wire 2 — marketplace job tenant isolation via SPAN partition.
 * Default OSS tenant matches tenant-economic-summary.ts and network-growth.ts.
 */

export const DEFAULT_OSS_TENANT_SPAN = 'span://v1/skenai/tenants/oss';
export const EXAMPLE_TENANT_SPAN = 'span://v1/skenai/tenants/example';

export function normalizeTenantSpan(span?: string | null): string {
  const trimmed = span?.trim();
  if (!trimmed) return DEFAULT_OSS_TENANT_SPAN;
  return trimmed.replace(/\/$/, '');
}

/** Map UI activeTenant slug or explicit SPAN to marketplace partition key. */
export function resolveMarketplaceTenantSpan(
  activeTenant?: string | null,
  explicitSpan?: string | null,
): string {
  if (explicitSpan?.trim()) {
    return normalizeTenantSpan(explicitSpan);
  }
  if (activeTenant === 'example-tenant') {
    return EXAMPLE_TENANT_SPAN;
  }
  if (activeTenant === 'oss' || !activeTenant) {
    return DEFAULT_OSS_TENANT_SPAN;
  }
  if (activeTenant.startsWith('span://')) {
    return normalizeTenantSpan(activeTenant);
  }
  return `span://v1/skenai/tenants/${activeTenant}`;
}

export interface MarketplaceJobAccessRow {
  user_id?: string | null;
  tenant_span?: string | null;
}

export interface MarketplaceJobAccessContext {
  tenantSpan?: string;
  userId?: string;
}

export function assertMarketplaceJobAccess(
  job: MarketplaceJobAccessRow,
  ctx: MarketplaceJobAccessContext,
): { ok: true } | { ok: false; reason: string } {
  if (ctx.tenantSpan) {
    const expected = normalizeTenantSpan(ctx.tenantSpan);
    const actual = normalizeTenantSpan(job.tenant_span);
    if (actual !== expected) {
      return {
        ok: false,
        reason: 'TENANT_ISOLATION: job belongs to another tenant span',
      };
    }
  }
  if (ctx.userId && job.user_id && job.user_id !== ctx.userId) {
    return {
      ok: false,
      reason: 'USER_ISOLATION: job belongs to another user',
    };
  }
  return { ok: true };
}
