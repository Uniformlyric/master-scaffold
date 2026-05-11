#!/usr/bin/env node
/**
 * snapshot-matrix.mjs
 *
 * Walks all 12 shells x 9 vibes = 108 compositions and snapshots each one
 * to .previews/ for manual QA before merge. Uses the dev-gated route at
 * /_preview/[shell]/[vibe] and Astro HMR to swap the singleton siteDna.
 *
 * Strategy
 * ----------------------------------------------------------------
 * 1. Back up master-scaffold/site-dna.json -> site-dna.json.preview-backup.
 * 2. Boot `astro dev` with PREVIEW_MATRIX=1.
 * 3. For each (shell, vibe):
 *      a. Mutate site-dna.json: pin designTokens.layoutShell + .vibe.
 *      b. Wait for Astro HMR to reload (small settle delay).
 *      c. Playwright navigate to /_preview/<shell>/<vibe-slug>.
 *      d. Wait for layout to paint, then screenshot to
 *         .previews/{shell}__{vibe-slug}.png.
 * 4. Restore site-dna.json on completion AND on SIGINT/SIGTERM/uncaught.
 *
 * Output
 * ----------------------------------------------------------------
 * - .previews/{shell}__{vibe-slug}.png   - per-combo screenshot
 * - .previews/index.html                  - contact-sheet style index
 * - .previews/manifest.json               - {shell, vibe, file, ms}[]
 *
 * Local-only QA tool. Playwright is NOT pinned in master-scaffold/package.json
 * (kept out so shipped client repos don't pull a 200 MB browser stack on
 * `npm ci` in Cloudflare). To run the matrix locally, install Playwright
 * temporarily into the workspace first:
 *   pnpm add -D -w playwright
 *   pnpm --filter master-scaffold exec playwright install chromium
 * Then run the script as below. Remove the workspace dep afterwards.
 *
 * Usage
 * ----------------------------------------------------------------
 *   pnpm --filter master-scaffold exec node scripts/snapshot-matrix.mjs
 *
 * Env vars
 * ----------------------------------------------------------------
 *   PORT             - dev server port (default 4321)
 *   PREVIEW_VIEWPORT - "1440x900" (default)
 *   PREVIEW_HMR_MS   - HMR settle delay in ms (default 900)
 *   PREVIEW_HEADFUL  - "1" to show the browser
 *   PREVIEW_LIMIT    - cap N combos for a quick smoke test
 *   PREVIEW_FULL     - "1" to capture the full page (default: viewport only)
 *
 * Requires `playwright` to be installed locally. The script will print a
 * pnpm-add command if it's missing.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE_DNA = resolve(ROOT, 'site-dna.json');
const SITE_DNA_BACKUP = resolve(ROOT, 'site-dna.json.preview-backup');
const PREVIEWS_DIR = resolve(ROOT, '.previews');

const PORT = Number(process.env.PORT ?? 4321);
const VIEWPORT = (process.env.PREVIEW_VIEWPORT ?? '1440x900').split('x').map(Number);
const VIEWPORT_W = VIEWPORT[0] ?? 1440;
const VIEWPORT_H = VIEWPORT[1] ?? 900;
const HMR_MS = Number(process.env.PREVIEW_HMR_MS ?? 900);
const HEADFUL = process.env.PREVIEW_HEADFUL === '1';
const LIMIT = process.env.PREVIEW_LIMIT ? Number(process.env.PREVIEW_LIMIT) : null;
const FULL_PAGE = process.env.PREVIEW_FULL === '1';

/* ----------------------------------------------------------------
 * 1. Resolve shell + vibe enums (mirror of site-dna package).
 * ---------------------------------------------------------------- */

const ALL_SHELLS = [
  'stack', 'atrium', 'ledger', 'vitrine', 'workshop', 'marquee',
  'drift', 'cabinet', 'letterhead', 'foyer', 'portico', 'cascade',
];

const ALL_VIBES = [
  'The Bold', 'The Professional', 'The Modern', 'The Artisan', 'The Wellness',
  'The Editorial', 'The Luxe', 'The Tech', 'The Heritage',
];

const vibeSlug = (v) => v.toLowerCase().replace(/\s+/g, '-');

const COMBOS = [];
for (const shell of ALL_SHELLS) {
  for (const vibe of ALL_VIBES) {
    COMBOS.push({ shell, vibe, slug: `${shell}__${vibeSlug(vibe)}` });
  }
}
const TOTAL = LIMIT ? Math.min(LIMIT, COMBOS.length) : COMBOS.length;

/* ----------------------------------------------------------------
 * 2. Lazy-load Playwright with a friendly error if missing.
 * ---------------------------------------------------------------- */

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('[snapshot-matrix] Playwright not installed.');
  console.error('  Run:  pnpm --filter master-scaffold add -D playwright');
  console.error('  Then: pnpm --filter master-scaffold exec playwright install chromium');
  process.exit(1);
}

/* ----------------------------------------------------------------
 * 3. Backup + restore site-dna.json (idempotent + signal-safe).
 * ---------------------------------------------------------------- */

let backedUp = false;

function backup() {
  if (!existsSync(SITE_DNA)) {
    throw new Error(`[snapshot-matrix] missing ${SITE_DNA}`);
  }
  copyFileSync(SITE_DNA, SITE_DNA_BACKUP);
  backedUp = true;
  console.log(`[snapshot-matrix] backed up site-dna.json -> ${SITE_DNA_BACKUP}`);
}

function restore() {
  if (!backedUp) return;
  if (existsSync(SITE_DNA_BACKUP)) {
    copyFileSync(SITE_DNA_BACKUP, SITE_DNA);
    unlinkSync(SITE_DNA_BACKUP);
    backedUp = false;
    console.log('[snapshot-matrix] restored site-dna.json');
  }
}

let cleanedUp = false;
function cleanup(code) {
  if (cleanedUp) return;
  cleanedUp = true;
  try { restore(); } catch (e) { console.error('[snapshot-matrix] restore failed:', e); }
  if (devServer && !devServer.killed) {
    try { devServer.kill('SIGINT'); } catch {}
  }
  if (typeof code === 'number') process.exit(code);
}

process.on('SIGINT', () => cleanup(130));
process.on('SIGTERM', () => cleanup(143));
process.on('uncaughtException', (err) => {
  console.error('[snapshot-matrix] uncaught:', err);
  cleanup(1);
});

/* ----------------------------------------------------------------
 * 4. Mutate site-dna.json for one combo.
 * ---------------------------------------------------------------- */

function mutateForCombo(shell, vibe) {
  const raw = JSON.parse(readFileSync(SITE_DNA_BACKUP, 'utf8'));
  raw.designTokens = raw.designTokens ?? {};
  raw.designTokens.signature = 'nuzum-method';
  raw.designTokens.vibe = vibe;
  raw.designTokens.layoutShell = shell;
  writeFileSync(SITE_DNA, JSON.stringify(raw, null, 2));
}

/* ----------------------------------------------------------------
 * 5. Boot Astro dev server + wait for it to be ready.
 * ---------------------------------------------------------------- */

let devServer = null;

async function bootDevServer() {
  console.log(`[snapshot-matrix] starting astro dev on port ${PORT}...`);
  /*
   * On Windows, `.cmd` shims (npx.cmd, astro.cmd) require shell:true to spawn.
   * Quote the args defensively to keep paths with spaces from breaking.
   */
  const isWin = process.platform === 'win32';
  const cmd = isWin ? 'npx.cmd' : 'npx';
  const args = ['astro', 'dev', '--port', String(PORT), '--host', '127.0.0.1'];
  devServer = spawn(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, PREVIEW_MATRIX: '1', FORCE_COLOR: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: isWin,
    windowsHide: true,
  });

  devServer.stdout.on('data', (chunk) => {
    const s = String(chunk);
    if (process.env.PREVIEW_VERBOSE === '1') process.stdout.write(`[astro] ${s}`);
  });
  devServer.stderr.on('data', (chunk) => {
    const s = String(chunk);
    if (process.env.PREVIEW_VERBOSE === '1') process.stderr.write(`[astro] ${s}`);
  });

  /* Poll the root URL until it responds or we time out (30s). */
  const url = `http://127.0.0.1:${PORT}/`;
  const deadline = Date.now() + 30_000;
  let lastErr = null;
  while (Date.now() < deadline) {
    if (devServer.killed || devServer.exitCode != null) {
      throw new Error(`[snapshot-matrix] astro dev exited early (code=${devServer.exitCode})`);
    }
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) {
        console.log(`[snapshot-matrix] dev server ready (${res.status})`);
        return;
      }
    } catch (e) {
      lastErr = e;
    }
    await sleep(500);
  }
  throw new Error(`[snapshot-matrix] dev server failed to start: ${lastErr?.message ?? 'timeout'}`);
}

/* ----------------------------------------------------------------
 * 6. Main loop.
 * ---------------------------------------------------------------- */

if (!existsSync(PREVIEWS_DIR)) {
  mkdirSync(PREVIEWS_DIR, { recursive: true });
}

backup();

try {
  await bootDevServer();
} catch (err) {
  console.error(err);
  cleanup(1);
}

const browser = await chromium.launch({ headless: !HEADFUL });
const context = await browser.newContext({
  viewport: { width: VIEWPORT_W, height: VIEWPORT_H },
  reducedMotion: 'reduce',
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const manifest = [];
const startedAt = Date.now();
let okCount = 0;
let failCount = 0;

for (let i = 0; i < TOTAL; i++) {
  const { shell, vibe, slug } = COMBOS[i];
  const t0 = Date.now();
  try {
    mutateForCombo(shell, vibe);
    /* Wait for Astro HMR to pick up the JSON change before navigating. */
    await sleep(HMR_MS);

    const url = `http://127.0.0.1:${PORT}/preview/${shell}/${vibeSlug(vibe)}/`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    /* Brief settle so leak gradients + drift transforms apply. */
    await sleep(400);

    const file = resolve(PREVIEWS_DIR, `${slug}.png`);
    await page.screenshot({ path: file, fullPage: FULL_PAGE });
    const ms = Date.now() - t0;
    manifest.push({ shell, vibe, slug, file: `${slug}.png`, ms, ok: true });
    okCount++;
    process.stdout.write(`  [${String(i + 1).padStart(3)}/${TOTAL}] ${slug.padEnd(34)} ${ms}ms\n`);
  } catch (err) {
    const ms = Date.now() - t0;
    manifest.push({ shell, vibe, slug, ms, ok: false, error: String(err?.message ?? err) });
    failCount++;
    process.stderr.write(`  [${String(i + 1).padStart(3)}/${TOTAL}] ${slug.padEnd(34)} FAIL: ${err?.message ?? err}\n`);
  }
}

await browser.close();

/* ----------------------------------------------------------------
 * 7. Write manifest + contact-sheet HTML.
 * ---------------------------------------------------------------- */

writeFileSync(resolve(PREVIEWS_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Nuzum Method - Shell x Vibe Preview Matrix</title>
  <style>
    body { background: #121410; color: #E8E4DA; font: 14px/1.5 system-ui, sans-serif; margin: 0; padding: 24px; }
    h1 { font: 600 22px/1.2 system-ui, sans-serif; margin: 0 0 4px; }
    .meta { color: #A8AC9F; margin-bottom: 24px; font-size: 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 18px; }
    figure { margin: 0; background: #1B201A; border: 1px solid #2a2f2a; border-radius: 10px; overflow: hidden; }
    figure img { display: block; width: 100%; height: auto; }
    figcaption { padding: 8px 12px; display: flex; justify-content: space-between; align-items: baseline; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; }
    figcaption .shell { color: #E8E4DA; font-weight: 500; }
    figcaption .vibe { color: #A8AC9F; }
    .fail { background: #2a1f1f; color: #f4cf6b; }
    .fail figcaption { color: #f4cf6b; }
  </style>
</head>
<body>
  <h1>Nuzum Method - Preview Matrix</h1>
  <div class="meta">
    Generated ${new Date().toISOString()} - ${okCount}/${TOTAL} ok, ${failCount} failed - viewport ${VIEWPORT_W}x${VIEWPORT_H}.
  </div>
  <div class="grid">
    ${manifest.map((m) => m.ok
      ? `<figure>
           <img src="${m.file}" loading="lazy" alt="${m.shell} / ${m.vibe}" />
           <figcaption><span class="shell">${m.shell}</span><span class="vibe">${m.vibe}</span></figcaption>
         </figure>`
      : `<figure class="fail">
           <figcaption><span class="shell">${m.shell}</span><span class="vibe">${m.vibe}</span></figcaption>
           <div style="padding: 12px; font-size: 11px;">${m.error ?? 'unknown error'}</div>
         </figure>`,
    ).join('\n    ')}
  </div>
</body>
</html>`;

writeFileSync(resolve(PREVIEWS_DIR, 'index.html'), indexHtml);

const elapsedS = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(
  `\n[snapshot-matrix] done. ${okCount}/${TOTAL} ok, ${failCount} failed in ${elapsedS}s`,
);
console.log(`  Open .previews/index.html to review the matrix.`);

cleanup(failCount > 0 ? 1 : 0);
