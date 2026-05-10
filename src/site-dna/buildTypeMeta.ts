import type { BuildType, Section, Vibe } from './zod.js';

export interface BuildTypeMeta {
  type: BuildType;
  shortLabel: string;
  blurb: string;
  /** Hex color for the chip on the lead list (no pure white/black). */
  chipColor: string;
  /** Single emoji-free glyph (1-2 letters) for compact UI density. */
  glyph: string;
  /** Vibe to default the wizard to when this build type is selected. */
  defaultVibe: Vibe;
  requiresMigration: boolean;
  /** Recommended initial section order. */
  defaultSections: ReadonlyArray<Section>;
}

export const BUILD_TYPE_META: Readonly<Record<BuildType, BuildTypeMeta>> = {
  'Fresh Build': {
    type: 'Fresh Build',
    shortLabel: 'Fresh',
    blurb: 'Greenfield - no prior web presence, full creative control.',
    chipColor: '#6366f1',
    glyph: 'FB',
    defaultVibe: 'The Modern',
    requiresMigration: false,
    defaultSections: ['Hero', 'Services', 'SocialProof', 'Pricing', 'Testimonials', 'Contact'],
  },
  'Site Rescue': {
    type: 'Site Rescue',
    shortLabel: 'Rescue',
    blurb: 'Existing site is broken or abandoned - replace it cleanly.',
    chipColor: '#ef4444',
    glyph: 'SR',
    defaultVibe: 'The Professional',
    requiresMigration: true,
    defaultSections: ['Hero', 'Services', 'BeforeAfter', 'Testimonials', 'Pricing', 'Contact'],
  },
  Redesign: {
    type: 'Redesign',
    shortLabel: 'Redesign',
    blurb: 'Working site, same content, new look. Preserve SEO.',
    chipColor: '#f59e0b',
    glyph: 'RD',
    defaultVibe: 'The Bold',
    requiresMigration: true,
    defaultSections: ['Hero', 'Services', 'Gallery', 'Testimonials', 'Pricing', 'Contact'],
  },
  'Replatform Migration': {
    type: 'Replatform Migration',
    shortLabel: 'Replatform',
    blurb: 'Move from Wix/Squarespace/WordPress/Webflow to your stack.',
    chipColor: '#8b5cf6',
    glyph: 'RP',
    defaultVibe: 'The Professional',
    requiresMigration: true,
    defaultSections: ['Hero', 'Services', 'SocialProof', 'Testimonials', 'Pricing', 'Contact'],
  },
  'Landing Page': {
    type: 'Landing Page',
    shortLabel: 'Landing',
    blurb: 'Single-page or short microsite for a campaign or launch.',
    chipColor: '#10b981',
    glyph: 'LP',
    defaultVibe: 'The Bold',
    requiresMigration: false,
    defaultSections: ['Hero', 'SocialProof', 'Services', 'Contact'],
  },
  'Subdomain / Sister Site': {
    type: 'Subdomain / Sister Site',
    shortLabel: 'Sub-site',
    blurb: 'New property under an existing client brand.',
    chipColor: '#0ea5e9',
    glyph: 'SS',
    defaultVibe: 'The Modern',
    requiresMigration: false,
    defaultSections: ['Hero', 'Services', 'Gallery', 'Contact'],
  },
  'Demo / Spec Build': {
    type: 'Demo / Spec Build',
    shortLabel: 'Demo',
    blurb: 'Speculative pitch, unsold. Free to be opinionated.',
    chipColor: '#a855f7',
    glyph: 'DM',
    defaultVibe: 'The Bold',
    requiresMigration: false,
    defaultSections: ['Hero', 'Services', 'Pricing', 'Contact'],
  },
  'Internal / Personal': {
    type: 'Internal / Personal',
    shortLabel: 'Internal',
    blurb: 'Your own properties (portfolio, marketing).',
    chipColor: '#64748b',
    glyph: 'IP',
    defaultVibe: 'The Modern',
    requiresMigration: false,
    defaultSections: ['Hero', 'Services', 'Gallery', 'Contact'],
  },
  'Event / Time-Boxed': {
    type: 'Event / Time-Boxed',
    shortLabel: 'Event',
    blurb: 'Wedding, fundraiser, conference - finite lifespan + hard deadline.',
    chipColor: '#ec4899',
    glyph: 'EV',
    defaultVibe: 'The Bold',
    requiresMigration: false,
    defaultSections: ['Hero', 'Services', 'Gallery', 'Contact'],
  },
  'Whitelabel / Reseller': {
    type: 'Whitelabel / Reseller',
    shortLabel: 'Whitelabel',
    blurb: 'Built for an agency partner who resells under their brand.',
    chipColor: '#14b8a6',
    glyph: 'WL',
    defaultVibe: 'The Professional',
    requiresMigration: false,
    defaultSections: ['Hero', 'Services', 'Pricing', 'Testimonials', 'Contact'],
  },
};

export function getBuildTypeMeta(type: BuildType): BuildTypeMeta {
  return BUILD_TYPE_META[type];
}
