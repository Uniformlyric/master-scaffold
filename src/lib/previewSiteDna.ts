import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseSiteDNA,
  layoutShellForVibe,
  ALL_SHELLS,
  VibeEnum,
  type LayoutShell,
  type SiteDNA,
  type Vibe,
} from '../site-dna/index.js';

const ALL_VIBES = VibeEnum.options as readonly Vibe[];

/**
 * previewSiteDna - factory for the preview matrix QA tool.
 *
 * Takes a (shell, vibe) pair and returns a SiteDNA with both pinned. The
 * returned object is built off the canonical site-dna.json baseline so
 * businessInfo / sectionOrder / palette stay realistic, with only the
 * shell + vibe + signature swapped in.
 *
 * NOTE: Astro section components import the SINGLETON `siteDna` from
 * src/lib/siteDna.ts. They do not accept the override returned here as a
 * prop. To actually drive the rendering pipeline with this synthetic
 * SiteDNA, scripts/snapshot-matrix.mjs writes site-dna.json itself before
 * each Playwright navigation (with restore on exit).
 *
 * This module is provided so:
 *   1. The _preview/[shell]/[vibe].astro route can validate combos at
 *      getStaticPaths time and emit a per-combo overlay.
 *   2. Future dev tooling can synthesize a SiteDNA without filesystem
 *      mutation (e.g. a server-rendered preview that takes a query param).
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = resolve(__dirname, '..', '..', 'site-dna.json');

/** Load the raw baseline JSON. Cached for fast getStaticPaths iteration. */
let cachedBaseline: unknown | null = null;
function loadBaseline(): unknown {
  if (cachedBaseline !== null) return cachedBaseline;
  if (!existsSync(BASELINE_PATH)) {
    throw new Error(`[previewSiteDna] missing baseline at ${BASELINE_PATH}`);
  }
  cachedBaseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  return cachedBaseline;
}

/**
 * Build a synthetic SiteDNA pinned to the given shell + vibe under the
 * Nuzum Method signature.
 */
export function previewSiteDna(shell: LayoutShell, vibe: Vibe): SiteDNA {
  const baseline = loadBaseline() as Record<string, unknown>;
  const baseTokens = (baseline.designTokens as Record<string, unknown>) ?? {};

  const merged = {
    ...baseline,
    designTokens: {
      ...baseTokens,
      vibe,
      signature: 'nuzum-method',
      layoutShell: shell,
    },
  };

  return parseSiteDNA(merged);
}

/** All 108 (shell, vibe) combos in canonical order. */
export function allPreviewCombos(): ReadonlyArray<{ shell: LayoutShell; vibe: Vibe }> {
  const combos: { shell: LayoutShell; vibe: Vibe }[] = [];
  for (const shell of ALL_SHELLS) {
    for (const vibe of ALL_VIBES) {
      combos.push({ shell, vibe: vibe as Vibe });
    }
  }
  return combos;
}

/** Slugify a vibe label for filesystem use. e.g. "The Bold" -> "the-bold" */
export function vibeSlug(v: Vibe): string {
  return v.toLowerCase().replace(/\s+/g, '-');
}

/** Resolve which shell would be picked under Auto for the given vibe. */
export function autoShellForVibe(vibe: Vibe): LayoutShell {
  return layoutShellForVibe(vibe);
}
