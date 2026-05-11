export * from './zod.js';
export * from './buildTypeMeta.js';
export * from './palette.js';
export * from './typography.js';
export * from './layoutShell.js';

import { LeadRecordSchema, SiteDNASchema, type LeadRecord, type SiteDNA } from './zod.js';

/**
 * Parse and validate a SiteDNA. Throws ZodError on failure.
 */
export function parseSiteDNA(input: unknown): SiteDNA {
  return SiteDNASchema.parse(input);
}

export function safeParseSiteDNA(input: unknown) {
  return SiteDNASchema.safeParse(input);
}

export function parseLeadRecord(input: unknown): LeadRecord {
  return LeadRecordSchema.parse(input);
}

export function safeParseLeadRecord(input: unknown) {
  return LeadRecordSchema.safeParse(input);
}
