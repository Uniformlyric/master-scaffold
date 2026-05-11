import type { LayoutShell, Vibe } from './zod.js';

/**
 * Compositional metadata for a layout shell.
 *
 * Shells share the Nuzum Method signature; they differ only in HOW sections
 * stack, where labels live, how dense the above-the-fold is, what mask shape
 * photos default to, and how aggressively cards peel over section boundaries.
 *
 * Section components consume this metadata via `data-shell` / `data-density`
 * attributes that SectionRenderer emits, then branch internally to render
 * the right variant.
 */
export interface ShellMeta {
  id: LayoutShell;
  /** Display number, e.g. "N°02". Used in wizard cards + as a blueprint label prefix. */
  number: string;
  /** Short human label. */
  name: string;
  /** Hero composition recipe - which Hero variant to render. */
  hero: 'stack' | 'atrium' | 'ledger' | 'vitrine' | 'marquee' | 'split' | 'drift' | 'pill';
  /** How many "objects" should populate above-the-fold per section. */
  density: 'quiet' | 'standard' | 'busy';
  /** Where blueprint labels sit on each section. */
  labelPosition: 'tl' | 'tr' | 'bl' | 'br' | 'inline';
  /** Default cinematic mask shape for masked photos in this shell. */
  defaultMask: 'blob' | 'pill' | 'capsule' | 'lozenge';
  /** 0 = no negative margins between sections, 2 = aggressive peel. */
  peelStrength: 0 | 1 | 2;
  /** Portico-style hairline rules + tick marks between sections. */
  exposedRules: boolean;
  /** Sequence of NM tones (obsidian / moss / paper / leak) cycled across sections. */
  toneCycle: ReadonlyArray<'obsidian' | 'moss' | 'paper' | 'leak'>;
  /** Drift intensity hint for hero/feature elements. */
  drift: 'none' | 'slow' | 'fast';
  /** Should section dividers render between consecutive same-tone sections? */
  forceDividers: boolean;
}

/**
 * Lock the recipe for each of the 12 shells.
 *
 * Tone cycles are tuned per shell so the rhythm of dark/light/leak matches
 * the shell's intent (e.g. portico is mostly obsidian + exposed rules,
 * letterhead alternates paper/obsidian for editorial spread feel).
 */
export const SHELL_META: Readonly<Record<LayoutShell, ShellMeta>> = {
  stack: {
    id: 'stack',
    number: 'N°01',
    name: 'Stack',
    hero: 'stack',
    density: 'standard',
    labelPosition: 'tl',
    defaultMask: 'blob',
    peelStrength: 1,
    exposedRules: false,
    toneCycle: ['obsidian', 'moss', 'paper', 'leak'],
    drift: 'slow',
    forceDividers: false,
  },
  atrium: {
    id: 'atrium',
    number: 'N°02',
    name: 'Atrium',
    hero: 'atrium',
    density: 'quiet',
    labelPosition: 'tr',
    defaultMask: 'blob',
    peelStrength: 1,
    exposedRules: false,
    toneCycle: ['obsidian', 'leak', 'moss', 'paper'],
    drift: 'slow',
    forceDividers: false,
  },
  ledger: {
    id: 'ledger',
    number: 'N°03',
    name: 'Ledger',
    hero: 'ledger',
    density: 'standard',
    labelPosition: 'tl',
    defaultMask: 'capsule',
    peelStrength: 0,
    exposedRules: true,
    toneCycle: ['paper', 'obsidian', 'paper', 'moss'],
    drift: 'none',
    forceDividers: true,
  },
  vitrine: {
    id: 'vitrine',
    number: 'N°04',
    name: 'Vitrine',
    hero: 'vitrine',
    density: 'busy',
    labelPosition: 'br',
    defaultMask: 'lozenge',
    peelStrength: 2,
    exposedRules: false,
    toneCycle: ['obsidian', 'leak', 'moss', 'leak'],
    drift: 'fast',
    forceDividers: false,
  },
  workshop: {
    id: 'workshop',
    number: 'N°05',
    name: 'Workshop',
    hero: 'stack',
    density: 'busy',
    labelPosition: 'tl',
    defaultMask: 'lozenge',
    peelStrength: 2,
    exposedRules: true,
    toneCycle: ['moss', 'paper', 'moss', 'leak'],
    drift: 'slow',
    forceDividers: true,
  },
  marquee: {
    id: 'marquee',
    number: 'N°06',
    name: 'Marquee',
    hero: 'marquee',
    density: 'standard',
    labelPosition: 'bl',
    defaultMask: 'capsule',
    peelStrength: 1,
    exposedRules: false,
    toneCycle: ['obsidian', 'leak', 'obsidian', 'moss'],
    drift: 'fast',
    forceDividers: false,
  },
  drift: {
    id: 'drift',
    number: 'N°07',
    name: 'Drift',
    hero: 'drift',
    density: 'standard',
    labelPosition: 'br',
    defaultMask: 'blob',
    peelStrength: 2,
    exposedRules: false,
    toneCycle: ['obsidian', 'leak', 'moss', 'leak'],
    drift: 'fast',
    forceDividers: false,
  },
  cabinet: {
    id: 'cabinet',
    number: 'N°08',
    name: 'Cabinet',
    hero: 'stack',
    density: 'busy',
    labelPosition: 'tl',
    defaultMask: 'pill',
    peelStrength: 1,
    exposedRules: true,
    toneCycle: ['moss', 'obsidian', 'moss', 'paper'],
    drift: 'slow',
    forceDividers: true,
  },
  letterhead: {
    id: 'letterhead',
    number: 'N°09',
    name: 'Letterhead',
    hero: 'pill',
    density: 'quiet',
    labelPosition: 'tl',
    defaultMask: 'pill',
    peelStrength: 0,
    exposedRules: true,
    toneCycle: ['paper', 'obsidian', 'paper', 'obsidian'],
    drift: 'none',
    forceDividers: true,
  },
  foyer: {
    id: 'foyer',
    number: 'N°10',
    name: 'Foyer',
    hero: 'split',
    density: 'standard',
    labelPosition: 'tr',
    defaultMask: 'capsule',
    peelStrength: 1,
    exposedRules: false,
    toneCycle: ['obsidian', 'paper', 'moss', 'leak'],
    drift: 'slow',
    forceDividers: false,
  },
  portico: {
    id: 'portico',
    number: 'N°11',
    name: 'Portico',
    hero: 'ledger',
    density: 'busy',
    labelPosition: 'tl',
    defaultMask: 'capsule',
    peelStrength: 0,
    exposedRules: true,
    toneCycle: ['obsidian', 'moss', 'obsidian', 'paper'],
    drift: 'none',
    forceDividers: true,
  },
  cascade: {
    id: 'cascade',
    number: 'N°12',
    name: 'Cascade',
    hero: 'drift',
    density: 'standard',
    labelPosition: 'br',
    defaultMask: 'blob',
    peelStrength: 2,
    exposedRules: false,
    toneCycle: ['obsidian', 'moss', 'leak', 'paper'],
    drift: 'fast',
    forceDividers: false,
  },
};

/**
 * "Auto" mode mapping: when no explicit shell is set, pick a sensible default
 * for the lead's vibe. Tuned so each vibe gets a shell that amplifies its
 * personality (Bold -> manifesto Marquee, Wellness -> centered Atrium, etc.).
 */
const VIBE_DEFAULT_SHELL: Readonly<Record<Vibe, LayoutShell>> = {
  'The Bold': 'marquee',
  'The Professional': 'foyer',
  'The Modern': 'drift',
  'The Artisan': 'workshop',
  'The Wellness': 'atrium',
  'The Editorial': 'ledger',
  'The Luxe': 'letterhead',
  'The Tech': 'cabinet',
  'The Heritage': 'portico',
};

/** Resolve the shell to use given a vibe (Auto-mode default). */
export function layoutShellForVibe(vibe: Vibe): LayoutShell {
  return VIBE_DEFAULT_SHELL[vibe];
}

/** Get the metadata recipe for any shell. */
export function shellMeta(shell: LayoutShell): ShellMeta {
  return SHELL_META[shell];
}

/** All shell ids in canonical order. */
export const ALL_SHELLS: ReadonlyArray<LayoutShell> = [
  'stack',
  'atrium',
  'ledger',
  'vitrine',
  'workshop',
  'marquee',
  'drift',
  'cabinet',
  'letterhead',
  'foyer',
  'portico',
  'cascade',
];
