import type { MultiTonePalette, Vibe } from './zod.js';

/**
 * Per the v1.9 brief, the Background Rule forbids pure white (#FFFFFF) and
 * pure black (#000000). Each vibe gets a curated multi-tone palette built
 * from warm or cool families with subtle variation.
 */

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
    coolTones: ['#1B263B'],
    surfaceVariants: ['#0b0a14', '#1a1325'],
    accent: '#F97316',
    ink: '#FEF9C3',
    muted: '#C4B5FD',
  },
  'The Professional': {
    warmTones: ['#FFFDD0', '#F5EFE0'],
    coolTones: ['#E8DCC4'],
    surfaceVariants: ['#FAF9F6', '#F5EFE0'],
    accent: '#1D4ED8',
    ink: '#1F2937',
    muted: '#475569',
  },
  'The Modern': {
    warmTones: ['#1F2A37'],
    coolTones: ['#1B263B'],
    surfaceVariants: ['#0f172a', '#111827'],
    accent: '#22D3EE',
    ink: '#F1F5F9',
    muted: '#94A3B8',
  },
  'The Artisan': {
    warmTones: ['#E8C9A5'],
    coolTones: ['#D9C9B5'],
    surfaceVariants: ['#FFF8EC', '#F5E6D3'],
    accent: '#B8542F',
    ink: '#3D2817',
    muted: '#6B4423',
  },
  'The Wellness': {
    warmTones: ['#F4E4DD'],
    coolTones: ['#D4E5D9'],
    surfaceVariants: ['#FAF6F2', '#E8F0E5'],
    accent: '#4F6F3F',
    ink: '#1F3320',
    muted: '#4F5C4F',
  },
  'The Editorial': {
    warmTones: ['#E8E0D0'],
    coolTones: ['#1A1A1A'],
    surfaceVariants: ['#FAFAFA', '#F0F0F0'],
    accent: '#B0102A',
    ink: '#0A0A0A',
    muted: '#525252',
  },
  'The Luxe': {
    warmTones: ['#F5EBD3'],
    coolTones: ['#2A2520'],
    surfaceVariants: ['#0A0A0A', '#1F1A0F'],
    accent: '#C9A961',
    ink: '#F5EBD3',
    muted: '#C2B393',
  },
  'The Tech': {
    warmTones: ['#E8EDF5'],
    coolTones: ['#E0E8F5'],
    surfaceVariants: ['#FAFBFC', '#F0F4FA'],
    accent: '#4338CA',
    ink: '#0F172A',
    muted: '#475569',
  },
  'The Heritage': {
    warmTones: ['#E8D9B8'],
    coolTones: ['#1A3A2E'],
    surfaceVariants: ['#FAF6EE', '#F0E8D8'],
    accent: '#722F37',
    ink: '#1A2C2A',
    muted: '#4A5C58',
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
