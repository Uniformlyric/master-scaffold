import {
  layoutShellForVibe,
  shellMeta,
  type LayoutShell,
  type ShellMeta,
  type SiteDNA,
} from '../site-dna/index.js';

/**
 * Resolve which layout shell a given site DNA should render with.
 *
 * - Explicit `siteDna.designTokens.layoutShell` wins (wizard user picked it).
 * - Otherwise we fall back to the per-vibe default ("Auto" mode).
 *
 * Pre-existing leads with no `layoutShell` field flow through the Auto path
 * with zero migration.
 */
export function resolveShell(siteDna: SiteDNA): LayoutShell {
  return siteDna.designTokens.layoutShell ?? layoutShellForVibe(siteDna.designTokens.vibe);
}

/** Resolve metadata in one step. */
export function resolveShellMeta(siteDna: SiteDNA): ShellMeta {
  return shellMeta(resolveShell(siteDna));
}

/**
 * Pick the NM tone for a section at `index`, given the shell's tone cycle.
 *
 * SectionRenderer uses this to set the background tone class on each section
 * (`.nm-tone-obsidian` / `.nm-tone-moss` / `.nm-tone-paper` / `.nm-tone-leak`).
 */
export type NmTone = 'obsidian' | 'moss' | 'paper' | 'leak';

export function nmToneForIndex(meta: ShellMeta, index: number): NmTone {
  const cycle = meta.toneCycle;
  if (cycle.length === 0) return 'obsidian';
  return cycle[index % cycle.length] ?? 'obsidian';
}

/** Convert NM tone -> background class name. */
export function nmToneClass(tone: NmTone): string {
  switch (tone) {
    case 'obsidian': return 'nm-tone-obsidian';
    case 'moss':     return 'nm-tone-moss';
    case 'paper':    return 'nm-tone-paper';
    case 'leak':     return 'nm-tone-leak';
  }
}

/** Compose the data-* attribute set every section gets from SectionRenderer. */
export interface ShellAttrs {
  'data-shell': LayoutShell;
  'data-density': 'quiet' | 'standard' | 'busy';
  'data-label-position': 'tl' | 'tr' | 'bl' | 'br' | 'inline';
  'data-mask': 'blob' | 'pill' | 'capsule' | 'lozenge';
  'data-peel': '0' | '1' | '2';
  'data-drift': 'none' | 'slow' | 'fast';
  'data-rules': 'on' | 'off';
}

export function shellAttrsFor(meta: ShellMeta): ShellAttrs {
  return {
    'data-shell': meta.id,
    'data-density': meta.density,
    'data-label-position': meta.labelPosition,
    'data-mask': meta.defaultMask,
    'data-peel': String(meta.peelStrength) as '0' | '1' | '2',
    'data-drift': meta.drift,
    'data-rules': meta.exposedRules ? 'on' : 'off',
  };
}
