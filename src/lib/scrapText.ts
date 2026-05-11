import type { SiteDNA, Section } from '../site-dna/index.js';

/**
 * Scrap tickers - the floating mono micro-labels tucked into section
 * corners that fight the "perfectly aligned centered stack" feel.
 *
 * Each section gets a stable, deterministic pair of (corner, text) tuples
 * derived from `(siteDna, section)` so the same site always produces the
 * same scraps. That property keeps the preview matrix reproducible.
 *
 * The text follows an architect's-blueprint vibe:
 *   - lat/lon if we can derive a region
 *   - ratio / index / sheet stamps
 *   - "PROOF SHEET" / "TX·NN" / "FOLIO·NN" style markers
 *
 * Edges are picked so two scraps in the same section don't collide
 * (one top-corner + one bottom-corner, or one left + one right).
 */

export type ScrapCorner = 'tl' | 'tr' | 'bl' | 'br' | 'ml' | 'mr';

export interface Scrap {
  corner: ScrapCorner;
  text: string;
}

/**
 * Hash a string into a deterministic small integer (FNV-1a-ish).
 * Used to pick a stable city or ratio without bringing in a hash lib.
 */
function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

const RATIOS = ['1:1.618', '2:3', '3:4', '5:8', '7:11', '4:5', '9:16'];
const FOLIOS = ['FOLIO·A', 'FOLIO·B', 'FOLIO·C', 'FOLIO·D', 'PLATE·I', 'PLATE·II', 'PLATE·III'];
const MICRO = ['SAFETY MARGIN', 'LEADING 0.92', 'TX·09', 'GRID·12', 'INDEX·NW', 'PROOF·SHEET', 'PEEL·STRONG', 'BLOB·VAR·A'];

/**
 * Per-section scrap recipes. Picks a stable pair from siteDna's name
 * + service-area + section identity.
 */
export function scrapsFor(siteDna: SiteDNA, section: Section): Scrap[] {
  const seed = `${siteDna.businessInfo.name ?? 'unknown'}/${section}`;
  const h = hash(seed);

  const ratio = RATIOS[h % RATIOS.length]!;
  const folio = FOLIOS[(h >> 5) % FOLIOS.length]!;
  const micro = MICRO[(h >> 11) % MICRO.length]!;
  const indexNo = `IDX·${String(((h >> 17) % 98) + 2).padStart(2, '0')}`;

  /*
   * Per-section pair. Each entry returns 1 or 2 scraps; the corners are
   * picked so they don't collide with the section's own corner blueprint
   * label (which always lives in tl/tr/bl/br per index rotation).
   *
   * Scraps default to the "off-axis" pair: if the blueprint label tends
   * top, we drop scraps bottom; if right, we drop left. The section
   * components can override via their own `<span class="nm-scrap">` if
   * needed.
   */
  switch (section) {
    case 'Hero':
      return [
        { corner: 'br', text: micro },
        { corner: 'ml', text: ratio },
      ];
    case 'ValueProps':
      return [
        { corner: 'tr', text: indexNo },
      ];
    case 'Services':
      return [
        { corner: 'tr', text: 'TX·09 / SAFETY MARGIN' },
        { corner: 'bl', text: folio },
      ];
    case 'SocialProof':
      return [
        { corner: 'br', text: 'PROOF·SHEET / ' + indexNo },
      ];
    case 'BeforeAfter':
      return [
        { corner: 'tr', text: 'COMP·A / COMP·B' },
        { corner: 'bl', text: ratio },
      ];
    case 'Pricing':
      return [
        { corner: 'bl', text: 'RATIO ' + ratio },
        { corner: 'tr', text: 'LEDGER / ' + indexNo },
      ];
    case 'Testimonials':
      return [
        { corner: 'mr', text: folio },
      ];
    case 'Gallery':
      return [
        { corner: 'bl', text: 'SELECTED·WORK / ' + indexNo },
        { corner: 'tr', text: micro },
      ];
    case 'FAQ':
      return [
        { corner: 'tr', text: 'INDEX·06 / Q+A' },
      ];
    case 'Contact':
      return [
        { corner: 'br', text: 'CORRESPONDENCE / ' + indexNo },
        { corner: 'tl', text: 'EST·SAME-DAY' },
      ];
    case 'Logo':
      return [];
    default:
      return [];
  }
}

/**
 * Convenience: returns the utility class for a corner.
 */
export function scrapCornerClass(corner: ScrapCorner): string {
  return `nm-scrap--${corner}`;
}
