import type { MultiTonePalette } from '../site-dna/index.js';

/**
 * Generate a programmatic CSS multi-radial gradient string from a palette.
 * Used by the Modern vibe and inline-applied on Hero/Contact sections.
 */
export function meshGradientFor(palette: MultiTonePalette): string {
  const colors = [
    palette.accent,
    palette.warmTones[0] ?? palette.accent,
    palette.coolTones[0] ?? palette.accent,
    palette.surfaceVariants[0] ?? palette.accent,
  ];

  const stops = [
    `radial-gradient(60% 60% at 18% 22%, color-mix(in oklab, ${colors[0]} 35%, transparent), transparent 70%)`,
    `radial-gradient(48% 48% at 82% 28%, color-mix(in oklab, ${colors[1]} 30%, transparent), transparent 70%)`,
    `radial-gradient(38% 38% at 70% 78%, color-mix(in oklab, ${colors[2]} 28%, transparent), transparent 70%)`,
    `radial-gradient(28% 28% at 30% 86%, color-mix(in oklab, ${colors[3]} 22%, transparent), transparent 70%)`,
  ];

  return stops.join(', ');
}
