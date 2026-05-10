import type { MultiTonePalette, Vibe } from './zod.js';

/**
 * Per the v1.9 brief, the Background Rule forbids pure white (#FFFFFF) and
 * pure black (#000000). Each vibe gets a curated multi-tone palette built
 * from warm or cool families with subtle variation.
 */

const WARM_FAMILY = ['#FAF9F6', '#F5EFE0', '#FFFDD0', '#EFE6D2', '#E8DCC4'] as const;
const COOL_FAMILY = ['#1B263B', '#2F3E46', '#1F2A37', '#0F172A', '#111827'] as const;

const SURFACE_WARM_LIGHT = ['#FFFBEA', '#F5EFE0', '#EFE6D2'] as const;
const SURFACE_COOL_DARK = ['#1F2A37', '#2F3E46', '#374151'] as const;

interface VibePaletteRecipe {
  warmTones: readonly string[];
  coolTones: readonly string[];
  surfaceVariants: readonly string[];
  accent: string;
  ink: string;
  muted: string;
}

const RECIPES: Readonly<Record<Vibe, VibePaletteRecipe>> = {
  'The Bold': {
    warmTones: ['#FFFDD0'],
    coolTones: COOL_FAMILY.slice(0, 2),
    surfaceVariants: SURFACE_COOL_DARK.slice(0, 2),
    accent: '#F97316',
    ink: '#FEF9C3',
    muted: '#A78BFA',
  },
  'The Professional': {
    warmTones: WARM_FAMILY.slice(0, 3),
    coolTones: ['#1D4ED8'],
    surfaceVariants: SURFACE_WARM_LIGHT,
    accent: '#1D4ED8',
    ink: '#1F2937',
    muted: '#475569',
  },
  'The Modern': {
    warmTones: ['#F1F5F9'],
    coolTones: COOL_FAMILY.slice(0, 3),
    surfaceVariants: SURFACE_COOL_DARK.slice(0, 3),
    accent: '#22D3EE',
    ink: '#F1F5F9',
    muted: '#94A3B8',
  },
};

/**
 * Generate a Multi-Tone palette for a vibe. Output is guaranteed to satisfy
 * the Site DNA Zod refinement (no #FFFFFF or #000000).
 */
export function generateMultiTonePalette(vibe: Vibe): MultiTonePalette {
  const recipe = RECIPES[vibe];
  return {
    warmTones: [...recipe.warmTones],
    coolTones: [...recipe.coolTones],
    surfaceVariants: [...recipe.surfaceVariants],
    accent: recipe.accent,
    ink: recipe.ink,
    muted: recipe.muted,
  };
}

/**
 * Returns true if a hex value violates the Stark-color rule.
 */
export function isStarkHex(hex: string): boolean {
  const u = hex.toUpperCase().replace(/^#/, '');
  const six = u.length === 3 ? u.split('').map((c) => c + c).join('') : u.slice(0, 6);
  return six === 'FFFFFF' || six === '000000';
}
