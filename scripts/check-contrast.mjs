#!/usr/bin/env node
/**
 * WCAG 2.1 contrast verifier for master-scaffold vibes + Nuzum Method signature.
 *
 * Two passes:
 *   1. Legacy fp-* pass: parses src/styles/vibes.css for :root[data-vibe='X']
 *      blocks and verifies every (text token x background token) pair declared
 *      in the closing-asset polish plan.
 *   2. Nuzum Method pass: parses src/styles/signature.css for the NM core block
 *      and per-vibe NM flavor blocks, then audits NM tokens against the dark
 *      obsidian/moss base, the bone paper, AND a worst-case synthesized leak
 *      overlay zone (each vibe's --nm-leak-1 blended at 50% opacity over
 *      obsidian).
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
const SIGNATURE_CSS = resolve(__dirname, '..', 'src', 'styles', 'signature.css');

if (!existsSync(VIBES_CSS)) {
  console.error(`[check-contrast] missing ${VIBES_CSS}`);
  process.exit(1);
}
if (!existsSync(SIGNATURE_CSS)) {
  console.error(`[check-contrast] missing ${SIGNATURE_CSS}`);
  process.exit(1);
}

const vibesCss = readFileSync(VIBES_CSS, 'utf8');
const signatureCss = readFileSync(SIGNATURE_CSS, 'utf8');

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

/**
 * Linear blend (sRGB-space approximation) of two hex colors at the given
 * alpha (0..1). Used to synthesize a worst-case leak-overlay zone:
 * leak color at 50% opacity sitting over obsidian.
 */
function blendHex(fgHex, bgHex, alpha) {
  const fg = parseHex(fgHex);
  const bg = parseHex(bgHex);
  const mix = (f, b) => Math.round(f * alpha + b * (1 - alpha));
  const r = mix(fg.r, bg.r);
  const g = mix(fg.g, bg.g);
  const b = mix(fg.b, bg.b);
  const hex = (n) => n.toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

/** Extract CSS custom-property declarations from each `selector` block. */
function parseBlocks(source, selectorRe) {
  const blocks = new Map();
  let m;
  while ((m = selectorRe.exec(source)) !== null) {
    const key = m[1];
    const body = m[2];
    if (!blocks.has(key)) blocks.set(key, {});
    const acc = blocks.get(key);
    const propRe = /(--[a-z][a-z0-9-]*)\s*:\s*([^;]+);/g;
    let p;
    while ((p = propRe.exec(body)) !== null) {
      acc[p[1]] = p[2].trim();
    }
  }
  return blocks;
}

function parseVibeBlocks(source) {
  return parseBlocks(source, /:root\[data-vibe=['"]([^'"]+)['"]\]\s*\{([^}]*)\}/g);
}

/** Parse `:root[data-signature='nuzum-method']` (single core block). */
function parseSignatureCoreBlock(source) {
  const re = /:root\[data-signature=['"]nuzum-method['"]\]\s*\{([^}]*)\}/g;
  const m = re.exec(source);
  if (!m) return {};
  const acc = {};
  const propRe = /(--[a-z][a-z0-9-]*)\s*:\s*([^;]+);/g;
  let p;
  while ((p = propRe.exec(m[1])) !== null) {
    acc[p[1]] = p[2].trim();
  }
  return acc;
}

/** Parse `:root[data-signature='nuzum-method'][data-vibe='X']` blocks (per-vibe NM flavor). */
function parseSignatureVibeBlocks(source) {
  return parseBlocks(
    source,
    /:root\[data-signature=['"]nuzum-method['"]\]\[data-vibe=['"]([^'"]+)['"]\]\s*\{([^}]*)\}/g,
  );
}

/** True only when the value is a usable hex color we can score. */
function isHex(v) {
  return typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v.trim());
}

/* -------------------------------------------------------------------- */
/* PASS 1: legacy fp-* contrast pairs (vibes.css)                        */
/* -------------------------------------------------------------------- */

const FP_PAIRS = [
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

const fpBlocks = parseVibeBlocks(vibesCss);
if (fpBlocks.size === 0) {
  console.error('[check-contrast] no :root[data-vibe="..."] blocks found in vibes.css.');
  process.exit(1);
}

const failures = [];
const summary = [];

for (const [vibe, props] of fpBlocks) {
  for (const [fgKey, bgKey, threshold, label] of FP_PAIRS) {
    const fg = props[fgKey];
    const bg = props[bgKey];
    if (!fg || !bg) {
      failures.push({
        layer: 'fp',
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
    summary.push({ layer: 'fp', vibe, label, fg, bg, ratio: r, threshold });
    if (r < threshold) {
      failures.push({ layer: 'fp', vibe, label, fg, bg, ratio: r, threshold, reason: 'below WCAG AA' });
    }
  }
}

/* -------------------------------------------------------------------- */
/* PASS 2: Nuzum Method nm-* contrast pairs (signature.css)              */
/* -------------------------------------------------------------------- */

const nmCore = parseSignatureCoreBlock(signatureCss);
if (Object.keys(nmCore).length === 0) {
  console.error("[check-contrast] no :root[data-signature='nuzum-method'] block found in signature.css.");
  process.exit(1);
}
const nmVibeBlocks = parseSignatureVibeBlocks(signatureCss);
if (nmVibeBlocks.size === 0) {
  console.error('[check-contrast] no per-vibe NM flavor blocks found in signature.css.');
  process.exit(1);
}

const NM_FLAT_PAIRS = [
  // [foreground token, background token, threshold, label]
  ['--nm-on-obsidian',       '--nm-obsidian', 4.5, 'on-obsidian'],
  ['--nm-on-obsidian-muted', '--nm-obsidian', 3.0, 'on-obsidian-muted'],
  ['--nm-on-obsidian',       '--nm-moss',     4.5, 'on-moss'],
  ['--nm-on-obsidian-muted', '--nm-moss',     3.0, 'on-moss-muted'],
  ['--nm-on-paper',          '--nm-paper',    4.5, 'on-paper'],
  ['--nm-on-paper-muted',    '--nm-paper',    3.0, 'on-paper-muted'],
  ['--nm-on-accent',         '--nm-accent',   4.5, 'on-accent'],
];

/*
 * Worst-case leak overlay: each vibe's leak-1 color blended at 50% over
 * obsidian. nm-on-leak text must clear 4.5:1 against this synthesized
 * background; nm-on-leak-muted must clear 3.0:1.
 *
 * 50% is a deliberate worst case - actual rendered leaks use blur(220px)
 * + opacity 0.55 + mix-blend-mode: screen, so peak luminance per pixel
 * is bounded above by this synthesis.
 */
const LEAK_BLEND_ALPHA = 0.5;

for (const [vibe, vibeProps] of nmVibeBlocks) {
  // Merge core defaults with vibe overrides. Vibe wins on conflict.
  const props = { ...nmCore, ...vibeProps };

  for (const [fgKey, bgKey, threshold, label] of NM_FLAT_PAIRS) {
    const fg = props[fgKey];
    const bg = props[bgKey];
    if (!fg || !bg) {
      failures.push({
        layer: 'nm',
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
    if (!isHex(fg) || !isHex(bg)) continue;
    const r = ratio(fg, bg);
    summary.push({ layer: 'nm', vibe, label, fg, bg, ratio: r, threshold });
    if (r < threshold) {
      failures.push({ layer: 'nm', vibe, label, fg, bg, ratio: r, threshold, reason: 'below WCAG AA' });
    }
  }

  // Worst-case leak-overlay zone: --nm-on-leak vs blend(leak-1, obsidian, 50%)
  const onLeak = props['--nm-on-leak'];
  const onLeakMuted = props['--nm-on-leak-muted'];
  const leak1 = props['--nm-leak-1'];
  const obsidian = props['--nm-obsidian'];

  if (isHex(onLeak) && isHex(leak1) && isHex(obsidian)) {
    const overlay = blendHex(leak1, obsidian, LEAK_BLEND_ALPHA);

    const r1 = ratio(onLeak, overlay);
    summary.push({ layer: 'nm', vibe, label: 'on-leak (worst-case)', fg: onLeak, bg: overlay, ratio: r1, threshold: 4.5 });
    if (r1 < 4.5) {
      failures.push({
        layer: 'nm',
        vibe,
        label: 'on-leak (worst-case)',
        fg: onLeak,
        bg: overlay,
        ratio: r1,
        threshold: 4.5,
        reason: `text fails over leak-1 @ ${LEAK_BLEND_ALPHA * 100}% over obsidian`,
      });
    }

    if (isHex(onLeakMuted)) {
      const r2 = ratio(onLeakMuted, overlay);
      summary.push({ layer: 'nm', vibe, label: 'on-leak-muted (worst-case)', fg: onLeakMuted, bg: overlay, ratio: r2, threshold: 3.0 });
      if (r2 < 3.0) {
        failures.push({
          layer: 'nm',
          vibe,
          label: 'on-leak-muted (worst-case)',
          fg: onLeakMuted,
          bg: overlay,
          ratio: r2,
          threshold: 3.0,
          reason: `muted text fails over leak-1 @ ${LEAK_BLEND_ALPHA * 100}% over obsidian`,
        });
      }
    }
  }
}

/* -------------------------------------------------------------------- */
/* Report                                                                */
/* -------------------------------------------------------------------- */

const fmt = (n) => n.toFixed(2);
const pad = (s, n) => String(s).padEnd(n, ' ');

if (process.env.CHECK_CONTRAST_VERBOSE === '1') {
  console.log(
    `\n${pad('layer', 6)} ${pad('vibe', 22)} ${pad('pair', 28)} ${pad('fg', 10)} ${pad('bg', 10)} ${pad('ratio', 7)} req`,
  );
  for (const r of summary) {
    console.log(
      `${pad(r.layer, 6)} ${pad(r.vibe, 22)} ${pad(r.label, 28)} ${pad(r.fg, 10)} ${pad(r.bg, 10)} ${pad(fmt(r.ratio), 7)} ${r.threshold}`,
    );
  }
}

if (failures.length > 0) {
  console.error('\n[check-contrast] WCAG AA failures:');
  console.error(
    `${pad('layer', 6)} ${pad('vibe', 22)} ${pad('pair', 28)} ${pad('fg', 10)} ${pad('bg', 10)} ${pad('ratio', 7)} req  reason`,
  );
  for (const f of failures) {
    console.error(
      `${pad(f.layer, 6)} ${pad(f.vibe, 22)} ${pad(f.label, 28)} ${pad(f.fg, 10)} ${pad(f.bg, 10)} ${pad(fmt(f.ratio), 7)} ${pad(f.threshold, 4)} ${f.reason}`,
    );
  }
  console.error(
    '\nFix the failing tokens in master-scaffold/src/styles/vibes.css or signature.css and re-run `npm run check:contrast`.',
  );
  process.exit(1);
}

console.log(
  `[check-contrast] OK - ${summary.length} pairs across ${fpBlocks.size} vibes pass WCAG AA (legacy fp-* + Nuzum Method nm-*).`,
);
