import type { Section } from '../site-dna/index.js';

const TONE_CYCLE = ['fp-tone-bg', 'fp-tone-surface', 'fp-tone-warm-1', 'fp-tone-cool-1'] as const;

/**
 * Pick the alternating tone class for a section based on its 0-based position
 * in the layout. Adjacent sections always get visually distinct tones to
 * create the v1.9 "Multi-Tone Layouts" depth without text-bloat.
 */
export function toneClassForIndex(index: number): string {
  return TONE_CYCLE[index % TONE_CYCLE.length] ?? 'fp-tone-bg';
}

/**
 * Heuristic: Hero/Contact tend to look better with a richer background
 * (gradient/mesh). Other sections cycle plain tones.
 */
export function shouldUseGradient(section: Section, index: number): boolean {
  if (index === 0 && section === 'Hero') return true;
  if (section === 'Contact') return true;
  return false;
}
