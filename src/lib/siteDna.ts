import { parseSiteDNA, type SiteDNA } from '../site-dna/index.js';
import rawDna from '../../site-dna.json' with { type: 'json' };

export const siteDna: SiteDNA = parseSiteDNA(rawDna);
