#!/usr/bin/env node
/**
 * WCAG 2.1 contrast verifier for master-scaffold vibes.
 *
 * Parses src/styles/vibes.css, then for every :root[data-vibe='...'] block,
 * computes the WCAG contrast ratio for every (text token x background token)
 * pair declared in section 1.1 of the closing-asset polish plan.
 *
 * Body text pairs must be >= 4.5:1, muted/large pairs must be >= 3.0:1.
 *
 * Exits with code 1 if any pair fails, printing a clean table.
 *
 * Wired as `npm run prebuild` so Cloudflare Pages refuses to ship a regression.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIBES_CSS = resolve(__dirname, '..', 'src', 'styles', 'vibes.css');

if (!existsSync(VIBES_CSS)) {
  console.error(`[check-contrast] missing ${VIBES_CSS}`);
  process.exit(1);
}

const css = readFileSync(VIBES_CSS, 'utf8');

/** WCAG relative luminance for an sRGB hex color. */
function luminance(hex) {
  const { r, g, b } = parseHex(hex);
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function parseHex(input) {
  let h = String(input).trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6); // drop alpha
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`[check-contrast] invalid hex: "${input}"`);
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function ratio(fgHex, bgHex) {
  const a = luminance(fgHex);
  const b = luminance(bgHex);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/** Extract CSS custom-property declarations from each :root[data-vibe='...'] block. */
function parseVibeBlocks(source) {
  const blocks = new Map();
  const re = /:root\[data-vibe=['"]([^'"]+)['"]\]\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const vibe = m[1];
    const body = m[2];
    if (!blocks.has(vibe)) blocks.set(vibe, {});
    const acc = blocks.get(vibe);
    const propRe = /(--fp-[a-z0-9-]+)\s*:\s*([^;]+);/g;
    let p;
    while ((p = propRe.exec(body)) !== null) {
      acc[p[1]] = p[2].trim();
    }
  }
  return blocks;
}

/** True only when the value is a usable hex color we can score. */
function isHex(v) {
  return typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v.trim());
}

const PAIRS = [
  // [foreground token, background token, threshold, label]
  ['--fp-on-bg',          '--fp-bg',      4.5, 'on-bg'],
  ['--fp-on-bg-muted',    '--fp-bg',      3.0, 'on-bg-muted'],
  ['--fp-on-surface',     '--fp-surface', 4.5, 'on-surface'],
  ['--fp-on-surface-muted', '--fp-surface', 3.0, 'on-surface-muted'],
  ['--fp-on-warm',        '--fp-warm-1',  4.5, 'on-warm'],
  ['--fp-on-warm-muted',  '--fp-warm-1',  3.0, 'on-warm-muted'],
  ['--fp-on-cool',        '--fp-cool-1',  4.5, 'on-cool'],
  ['--fp-on-cool-muted',  '--fp-cool-1',  3.0, 'on-cool-muted'],
  ['--fp-on-accent',      '--fp-accent',  4.5, 'on-accent'],
];

const blocks = parseVibeBlocks(css);
if (blocks.size === 0) {
  console.error('[check-contrast] no :root[data-vibe="..."] blocks found.');
  process.exit(1);
}

const failures = [];
const summary = [];

for (const [vibe, props] of blocks) {
  for (const [fgKey, bgKey, threshold, label] of PAIRS) {
    const fg = props[fgKey];
    const bg = props[bgKey];
    if (!fg || !bg) {
      failures.push({
        vibe,
        label,
        fg: fg ?? '(missing)',
        bg: bg ?? '(missing)',
        ratio: 0,
        threshold,
        reason: `missing ${fg ? bgKey : fgKey}`,
      });
      continue;
    }
    if (!isHex(fg) || !isHex(bg)) {
      // color-mix(...) etc. - skip, we only audit hex tokens.
      continue;
    }
    const r = ratio(fg, bg);
    summary.push({ vibe, label, fg, bg, ratio: r, threshold });
    if (r < threshold) {
      failures.push({ vibe, label, fg, bg, ratio: r, threshold, reason: 'below WCAG AA' });
    }
  }
}

const fmt = (n) => n.toFixed(2);
const pad = (s, n) => String(s).padEnd(n, ' ');

if (process.env.CHECK_CONTRAST_VERBOSE === '1') {
  console.log(
    `\n${pad('vibe', 22)} ${pad('pair', 18)} ${pad('fg', 10)} ${pad('bg', 10)} ${pad('ratio', 7)} req`,
  );
  for (const r of summary) {
    console.log(
      `${pad(r.vibe, 22)} ${pad(r.label, 18)} ${pad(r.fg, 10)} ${pad(r.bg, 10)} ${pad(fmt(r.ratio), 7)} ${r.threshold}`,
    );
  }
}

if (failures.length > 0) {
  console.error('\n[check-contrast] WCAG AA failures:');
  console.error(
    `${pad('vibe', 22)} ${pad('pair', 18)} ${pad('fg', 10)} ${pad('bg', 10)} ${pad('ratio', 7)} req  reason`,
  );
  for (const f of failures) {
    console.error(
      `${pad(f.vibe, 22)} ${pad(f.label, 18)} ${pad(f.fg, 10)} ${pad(f.bg, 10)} ${pad(fmt(f.ratio), 7)} ${pad(f.threshold, 4)} ${f.reason}`,
    );
  }
  console.error(
    '\nFix the failing tokens in master-scaffold/src/styles/vibes.css and re-run `npm run check:contrast`.',
  );
  process.exit(1);
}

console.log(
  `[check-contrast] OK - ${summary.length} pairs across ${blocks.size} vibes pass WCAG AA.`,
);
