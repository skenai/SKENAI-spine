/**
 * Wire 3 dogfood preset — first OPEN PR: Sweeper README + RATIO enterprise portal link.
 * PIIE OPEN path only (src/sweeper/).
 */

export const WIRE3_DOGFOOD_REPO = 'skenai-infra-tools' as const;

export const WIRE3_DOGFOOD_FILE = 'src/sweeper/README.md' as const;

export const WIRE3_DOGFOOD_HEAD_BRANCH = 'oss-wire3-ratio-portal-link' as const;

const RATIO_PORTAL_BLOCK = `### RATIO enterprise portal

After running Sweeper locally, classify export-control workflow items and archive portable-proof receipts on the [RATIO enterprise portal](https://www.ratio.skenai.net). Workflow attestation — not certification.

`;

const RATIO_MARKER = '### RATIO enterprise portal';

/** Insert RATIO link block before Contributing if absent. */
export function applyWire3SweeperReadmePatch(existingContent: string): string {
  if (existingContent.includes(RATIO_MARKER)) {
    return existingContent;
  }
  const anchor = '\n## Contributing\n';
  const idx = existingContent.indexOf(anchor);
  if (idx === -1) {
    return `${existingContent.trimEnd()}\n\n${RATIO_PORTAL_BLOCK}`;
  }
  return `${existingContent.slice(0, idx)}\n${RATIO_PORTAL_BLOCK}${existingContent.slice(idx)}`;
}

const H1_MARKER_RE = /^<!-- merge-funnel-h1: .* -->$/;

/** RATIO patch + a single invisible marker line keyed to the trajectory id,
 * so every H1 run produces a real diff without growing the README. */
export function applyH1DogfoodPatch(base: string, trajectoryId: string): string {
  const patched = applyWire3SweeperReadmePatch(base);
  const marker = `<!-- merge-funnel-h1: ${trajectoryId} -->`;
  const lines = patched.split('\n');
  const idx = lines.findIndex((l) => H1_MARKER_RE.test(l.trim()));
  const body = idx === -1
    ? `${patched.trimEnd()}\n\n${marker}`
    : lines.map((l, i) => (i === idx ? marker : l)).join('\n');
  return `${body.trimEnd()}\n`;
}

/** Fetch live Sweeper README (GitHub API when token present; raw fallback for public). */
export async function fetchWire3DogfoodReadme(opts?: {
  token?: string | null;
  org?: string;
}): Promise<string> {
  const token = opts?.token?.trim();
  const org = opts?.org ?? 'skenai';

  if (token) {
    const apiRes = await fetch(
      `https://api.github.com/repos/${org}/${WIRE3_DOGFOOD_REPO}/contents/${WIRE3_DOGFOOD_FILE}?ref=main`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        cache: 'no-store',
      },
    );
    if (apiRes.ok) {
      const json = (await apiRes.json()) as { content?: string; encoding?: string };
      if (json.content && json.encoding === 'base64') {
        return Buffer.from(json.content.replace(/\n/g, ''), 'base64').toString('utf-8');
      }
    }
  }

  const rawUrl = `https://raw.githubusercontent.com/${org}/${WIRE3_DOGFOOD_REPO}/main/${WIRE3_DOGFOOD_FILE}`;
  const res = await fetch(rawUrl, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`[wire3-dogfood] README fetch HTTP ${res.status}`);
  }
  return res.text();
}

export function wire3DogfoodPreviewSnippet(patched: string): string {
  const idx = patched.indexOf(RATIO_MARKER);
  if (idx === -1) return RATIO_PORTAL_BLOCK.trim();
  return patched.slice(idx, idx + 420).trim();
}

export function wire3DogfoodPrMeta() {
  return {
    repo: WIRE3_DOGFOOD_REPO,
    filePath: WIRE3_DOGFOOD_FILE,
    headBranch: WIRE3_DOGFOOD_HEAD_BRANCH,
    commitMessage: 'docs(sweeper): link RATIO enterprise attestation portal',
    prTitle: 'docs(sweeper): RATIO enterprise portal link (Wire 3 dogfood)',
    prBody: [
      '## Summary',
      'Adds RATIO enterprise portal link block to Sweeper README — Wire 3 governed OSS dogfood.',
      '',
      'Opened via `POST /api/oss/pr-open` with capability lease + path allowlist.',
      '',
      '**Human merge required** — no auto-merge.',
    ].join('\n'),
  };
}

export const WIRE3_AAT_HASH = 'wire3-dogfood' as const;

export const WIRE3_AAT_RATIO_URL = 'https://www.ratio.skenai.net/#ratio-wire3-aat' as const;

export function wire3WorkspaceHref(origin = 'https://www.skenai.net'): string {
  return `${origin.replace(/\/$/, '')}/workspace?pane=ingress#${WIRE3_AAT_HASH}`;
}
