import { parseSiteDNA, type SiteDNA } from '@flashpoint/site-dna';
import rawDna from '../../site-dna.json' with { type: 'json' };

export const siteDna: SiteDNA = parseSiteDNA(rawDna);
