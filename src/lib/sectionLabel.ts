import type { ShellMeta } from '../site-dna/layoutShell.js';

export type LabelCorner = 'tl' | 'tr' | 'bl' | 'br';

/**
 * Deterministic blueprint-label corner rotation.
 *
 * The eight NM principles in your brief call for labels "tucked into corners
 * in a Monospace font". The single biggest source of the templaty feel in
 * the current rendering is that every section emits an INLINE
 * `<p class="font-mono uppercase">{eyebrow}</p>` directly above its headline -
 * the exact eyebrow + headline + body stack that every Bootstrap and
 * Squarespace template repeats.
 *
 * To break that, every section now lives inside a <section> with an
 * absolute-positioned corner stamp, and which corner is chosen rotates per
 * section index so the page reads like a sequence of architect's sheets, not
 * a stack of identical bands.
 *
 * Cycle:
 *   index 0 -> tl
 *   index 1 -> tr
 *   index 2 -> bl
 *   index 3 -> br
 *   index 4+ -> falls back to the shell's preferred labelPosition
 *
 * Special case: the shell's labelPosition is 'inline' for legacy reasons.
 * Under NM we never go inline - it falls back to 'tl'.
 */
export function cornerForIndex(meta: ShellMeta, index: number): LabelCorner {
  const ROTATION: LabelCorner[] = ['tl', 'tr', 'bl', 'br'];
  if (index < ROTATION.length) {
    return ROTATION[index]!;
  }
  const pref = meta.labelPosition;
  if (pref === 'inline') return 'tl';
  return pref;
}

/** Convenience: returns the full utility class string for a corner. */
export function cornerClass(corner: LabelCorner): string {
  return `nm-label--corner-${corner}`;
}

/**
 * Compose the section's blueprint-label text from shell number + section name.
 * Example: meta.number = "N°08", section = "Services" -> "N°08 / SERVICES".
 *
 * The uppercase + " / " separator is part of the visual signature; do not
 * reformat per-section. Mono labels read as architectural annotations.
 */
export function labelTextFor(meta: ShellMeta, section: string): string {
  return `${meta.number} / ${section.toUpperCase()}`;
}
