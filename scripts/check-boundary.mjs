#!/usr/bin/env node
/**
 * Boundary check — keeps @skenai/spine on the OPEN side of the membrane.
 *
 * Fails if any file under src/** contains:
 *   - "supabase" (case-insensitive) — engine persistence is CLOSED
 *   - "@aws-sdk" — cloud SDKs are engine internals
 *   - process.env — the spine reads no environment; pass config as parameters
 *   - an fs / node:fs import — pure schema + helpers, no I/O
 *   - any private term (closed client / lane / tenant names)
 *
 * Exits 1 and prints every hit. Wired as `npm run check:boundary`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'src');

const PRIVATE_TERMS =
  /kadita|akita|boker|arbor|tenant_connector|askenai|dxc|sopra|sabel|shadow|alberta|herd|iprd|bob7k|nxprt|pshdw|misterlindsay|shibaken|1WXMGr|1lrtpz/i;

const RULES = [
  { name: 'supabase', re: /supabase/i, why: 'engine persistence is CLOSED and never ships' },
  { name: '@aws-sdk', re: /@aws-sdk/i, why: 'cloud SDKs are engine internals' },
  { name: 'process.env', re: /process\.env/, why: 'no environment access in the spine — pass config as parameters' },
  {
    name: 'fs import',
    re: /from\s+['"](?:node:)?fs(?:\/[\w.-]+)?['"]|import\s+['"](?:node:)?fs(?:\/[\w.-]+)?['"]|require\(\s*['"](?:node:)?fs['"]\s*\)/,
    why: 'the spine is pure schema + helpers — no I/O',
  },
  { name: 'private term', re: PRIVATE_TERMS, why: 'closed client / lane names never ship' },
];

/**
 * Narrow allowlist: the published connector contract legitimately contains
 * the literal "tenant_connector" — it is the public contract id, not a leak.
 * These literals are stripped before scanning, in the listed file only.
 * Do not extend this list to hide a leak — fix the file instead.
 */
const ALLOWLIST = [
  {
    file: join('a2a', 'tenant-connector-contract.ts'),
    re: /skenai\.tenant_connector\.v0\.1|TENANT_CONNECTOR_CONTRACT/g,
  },
  {
    // The test asserts the contract id by shape and must name the export.
    file: join('__tests__', 'tenant-connector-contract.test.ts'),
    re: /TENANT_CONNECTOR_CONTRACT/g,
  },
  {
    // Negative-perimeter assertions name the forbidden ids they test for.
    file: join('__tests__', 'shoes-receipts.test.ts'),
    re: /kadita|akita|boker|arbor|tenant_connector|askenai|dxc|sopra|sabel|shadow|alberta|nexpert|PLNV|NEBIUS|ENDPT|SUNGRID|AUKERA|BOB7K|HERD|IPRD|SABEL|NXPRT|PSHDW|SOCKS/g,
  },
];

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile()) yield p;
  }
}

let failures = 0;

for (const file of walk(SRC)) {
  const rel = relative(SRC, file);
  let text = readFileSync(file, 'utf8');
  for (const allow of ALLOWLIST) {
    if (rel === allow.file) text = text.replace(allow.re, '');
  }
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      if (rule.re.test(line)) {
        failures += 1;
        console.error(`BOUNDARY FAIL ${rel}:${i + 1} [${rule.name}] ${rule.why}\n  ${line.trim()}`);
      }
    }
  });
}

if (failures > 0) {
  console.error(`\ncheck:boundary — ${failures} violation(s). The spine ships no engine internals.`);
  process.exit(1);
}
console.log(`check:boundary — clean (${[...walk(SRC)].length} files scanned under src/).`);
