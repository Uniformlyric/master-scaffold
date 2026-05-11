import { z } from 'zod';

export const VibeEnum = z.enum([
  'The Bold',
  'The Professional',
  'The Modern',
  'The Artisan',
  'The Wellness',
  'The Editorial',
  'The Luxe',
  'The Tech',
  'The Heritage',
]);

export const SectionEnum = z.enum([
  'Hero',
  'Services',
  'Testimonials',
  'Pricing',
  'Contact',
  'SocialProof',
  'Logo',
  'Gallery',
  'BeforeAfter',
  'ValueProps',
  'FAQ',
]);

export const ProvisioningModeEnum = z.enum(['shared', 'isolated']);

/**
 * Visual signature system.
 *
 * 'nuzum-method' is the only signature today and the default for all new leads.
 * It defines the dark obsidian + moss base, light-leak rendering rules,
 * river-stone geometry, technical-serif type system, heavy-drift motion,
 * exposed-blueprint labels and cinematic-masked photos.
 *
 * Vibes paint within this signature; layout shells compose within it.
 *
 * The enum is structured so a future 'classic' value could re-enable the
 * original flat-vibe rendering by adding one CSS block keyed on
 * `[data-signature='classic']`.
 */
export const SignatureEnum = z.enum(['nuzum-method']);

/**
 * The 12 layout shells. Shell != component; shell is a composition recipe
 * that decides which variant of each section to render and how they overlap.
 *
 * - stack       N°01  Vertical narrative, peel-overlapping cards. Default fallback.
 * - atrium      N°02  Centered serif italic statement hero, sections fan out staggered.
 * - ledger      N°03  Editorial spread, type-led hero, multi-column body, sidebar metadata.
 * - vitrine     N°04  Gallery-first, hero IS masked photo grid in leak field.
 * - workshop    N°05  Maximum intentional clutter above fold.
 * - marquee     N°06  Giant display headline fills viewport, manifesto poster.
 * - drift       N°07  Maximum motion, multi-layer parallax hero, animated leaks.
 * - cabinet     N°08  Dense tile-grid first, tiny hero.
 * - letterhead  N°09  Maximum restraint, mostly type + one masked pill photo.
 * - foyer       N°10  Split hero (type left / masked photo right), asymmetric balance.
 * - portico     N°11  Heaviest blueprint labeling, numbered sections w/ exposed rules.
 * - cascade     N°12  Cinematic top-down reveal, strong peel + drift between sections.
 */
export const LayoutShellEnum = z.enum([
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
]);

export const LeadStatusEnum = z.enum([
  'Discovery',
  'Demo Generated',
  'Proposal Sent',
  'Closed-Won',
  'Closed-Lost',
  'On-Hold',
]);

export const BuildTypeEnum = z.enum([
  'Fresh Build',
  'Site Rescue',
  'Redesign',
  'Replatform Migration',
  'Landing Page',
  'Subdomain / Sister Site',
  'Demo / Spec Build',
  'Internal / Personal',
  'Event / Time-Boxed',
  'Whitelabel / Reseller',
]);

export const EngagementTypeEnum = z.enum([
  'Paid Fixed',
  'Paid Retainer',
  'Pro Bono',
  'Equity',
  'Demo',
  'Internal',
]);

export const UrgencyTierEnum = z.enum(['Standard', 'Rush', 'Event-Deadline']);

export const IntegrationEnum = z.enum([
  'Stripe',
  'HubSpot',
  'GoHighLevel',
  'Calendly',
  'Acuity',
  'Mailchimp',
  'Resend',
  'Custom Form',
  'None',
]);

export const ComplianceEnum = z.enum([
  'WCAG-AA',
  'WCAG-AAA',
  'ADA',
  'HIPAA',
  'GDPR',
  'CCPA',
  'None',
]);

export const LocalizationEnum = z.enum(['English Only', 'Bilingual EN+ES', 'Multilingual']);

export const DomainStatusEnum = z.enum([
  'New Purchase Needed',
  'Client Owns It',
  'Transferring Registrar',
  'Subdomain Of Existing',
  'Undecided',
]);

export const PriorPlatformEnum = z.enum([
  'Wix',
  'Squarespace',
  'WordPress.org',
  'WordPress.com',
  'Webflow',
  'Shopify',
  'Custom Code',
  'Other',
]);

export const SeoContinuityEnum = z.enum([
  'Fresh Start',
  'Preserve URLs',
  'Redirect Map Required',
]);

export const ContentCopyEnum = z.enum([
  'Provided',
  'Outline Only',
  'Needs Writing',
  'AI-Assisted',
]);

export const ContentPhotosEnum = z.enum(['Provided', 'Stock Acceptable', 'Photoshoot Needed']);

export const ContentLogoEnum = z.enum(['Have It', 'Need Design', 'Have But Needs Refresh']);

export const ProvisioningStepStatusEnum = z.enum([
  'pending',
  'in_progress',
  'ok',
  'error',
  'skipped',
]);

export const ProvisioningOverallStatusEnum = z.enum([
  'idle',
  'running',
  'succeeded',
  'failed',
  'partial',
]);

export const HistoryKindEnum = z.enum([
  'status_change',
  'wizard_field',
  'asset_upload',
  'provision_step',
  'vfs_write',
  'note',
]);

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const NonStarkHex = z
  .string()
  .regex(HEX_RE, 'Must be a valid hex color (e.g., #FAF9F6)')
  .refine(
    (v) => {
      const u = v.toUpperCase().replace(/^#/, '');
      const six = u.length === 3 ? u.split('').map((c) => c + c).join('') : u.slice(0, 6);
      return six !== 'FFFFFF' && six !== '000000';
    },
    { message: "Pure white (#FFFFFF) and pure black (#000000) are forbidden by Site DNA design rules. Use a warm or cool tint instead." },
  );

export const ServiceSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priceLabel: z.string().optional(),
});

export const BusinessInfoSchema = z.object({
  name: z.string().optional(),
  tagline: z.string().optional(),
  valueProp: z.string().optional(),
  services: z.array(ServiceSchema).optional(),
});

export const AnimationsSchema = z.object({
  enableGradients: z.boolean().default(true),
  reducedMotionFallback: z.boolean().default(true),
});

export const MultiTonePaletteSchema = z.object({
  warmTones: z.array(NonStarkHex).default([]),
  coolTones: z.array(NonStarkHex).default([]),
  surfaceVariants: z.array(NonStarkHex).default([]),
  accent: NonStarkHex,
  ink: NonStarkHex.optional(),
  muted: NonStarkHex.optional(),
});

export const TypographySchema = z.object({
  headingStack: z.string(),
  bodyStack: z.string(),
  borderRadius: z.string(),
  borderWidth: z.string(),
  letterSpacing: z.string().optional(),
});

export const DesignTokensSchema = z.object({
  vibe: VibeEnum,
  /**
   * Visual signature. Always defaults to 'nuzum-method'. Existing leads
   * pre-dating the Nuzum Method rollout get this backfilled on Zod parse,
   * no migration script required.
   */
  signature: SignatureEnum.default('nuzum-method'),
  /**
   * Layout shell. Optional - absence means "Auto" (resolved from vibe via
   * `layoutShellForVibe(vibe)` at render time). Pre-existing leads keep
   * working with no migration.
   */
  layoutShell: LayoutShellEnum.optional(),
  animations: AnimationsSchema.default({ enableGradients: true, reducedMotionFallback: true }),
  multiTonePalette: MultiTonePaletteSchema,
  typography: TypographySchema,
});

/** Firebase Storage URL or mirrored static path (`/assets/...`) after provisioning. */
const AssetDownloadURLSchema = z
  .string()
  .min(1)
  .refine(
    (s) => s.startsWith('/') || /^https?:\/\/.+/i.test(s),
    { message: 'Must be an http(s) URL or a path starting with /' },
  );

export const AssetRefSchema = z.object({
  storagePath: z.string(),
  downloadURL: AssetDownloadURLSchema,
  mimeType: z.string(),
  bytes: z.number().int().nonnegative(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  alt: z.string().optional(),
});

export const AssetsSchema = z.object({
  logo: AssetRefSchema.optional(),
  hero: AssetRefSchema.optional(),
  gallery: z.array(AssetRefSchema).optional(),
});

export const LayoutSchema = z.object({
  sectionOrder: z.array(SectionEnum).default([]),
});

export const SiteDNASchema = z.object({
  businessInfo: BusinessInfoSchema,
  designTokens: DesignTokensSchema,
  assets: AssetsSchema.default({}),
  layout: LayoutSchema,
});

export const EngagementSchema = z.object({
  buildType: BuildTypeEnum,
  engagementType: EngagementTypeEnum,
  urgency: z.object({
    tier: UrgencyTierEnum.default('Standard'),
    dueAt: z.string().datetime().optional(),
  }),
});

export const ContextSchema = z.object({
  industryVertical: z.string().optional(),
  integrations: z.array(IntegrationEnum).default([]),
  compliance: z.array(ComplianceEnum).default([]),
  localization: LocalizationEnum.default('English Only'),
});

export const DomainSchema = z.object({
  status: DomainStatusEnum,
  currentDomain: z.string().optional(),
  targetDomain: z.string().optional(),
});

export const MigrationSchema = z.object({
  priorPlatform: PriorPlatformEnum.optional(),
  priorUrl: z.string().url().optional(),
  seoContinuity: SeoContinuityEnum.default('Fresh Start'),
});

export const ContentReadinessSchema = z.object({
  copy: ContentCopyEnum.default('Outline Only'),
  photos: ContentPhotosEnum.default('Stock Acceptable'),
  logo: ContentLogoEnum.default('Have It'),
});

export const ProvisioningStepSchema = z.object({
  name: z.string(),
  status: ProvisioningStepStatusEnum,
  message: z.string().optional(),
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
});

export const ProvisioningSchema = z.object({
  status: ProvisioningOverallStatusEnum.default('idle'),
  /**
   * Provisioning mode:
   *  - 'shared'   -> use the shared `flashpoint-demo` Firebase project
   *                  (skips isolation_handshake, never burns the GCP 5/day quota).
   *                  This is the default so prospect demos are unlimited.
   *  - 'isolated' -> create a per-lead Firebase project via isolation_handshake.
   *                  Use only when promoting a lead to a paying client.
   */
  mode: ProvisioningModeEnum.default('shared'),
  runId: z.string().optional(),
  repo: z.string().optional(),
  pagesProject: z.string().optional(),
  hostname: z.string().optional(),
  clientFirebaseProjectId: z.string().optional(),
  steps: z.array(ProvisioningStepSchema).default([]),
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
});

export const HistoryEntrySchema = z.object({
  id: z.string().optional(),
  ts: z.string().datetime(),
  actorUid: z.string().optional(),
  actorEmail: z.string().email().optional(),
  kind: HistoryKindEnum,
  payload: z.record(z.unknown()),
});

const MIGRATION_REQUIRED: ReadonlySet<z.infer<typeof BuildTypeEnum>> = new Set([
  'Site Rescue',
  'Redesign',
  'Replatform Migration',
]);

export const LeadRecordSchema = z
  .object({
    id: z.string().min(1),
    ownerUid: z.string().min(1),
    leadStatus: LeadStatusEnum.default('Discovery'),
    engagement: EngagementSchema,
    context: ContextSchema,
    domain: DomainSchema,
    migration: MigrationSchema.optional(),
    content: ContentReadinessSchema,
    siteDna: SiteDNASchema,
    provisioning: ProvisioningSchema.default({ status: 'idle', steps: [] }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    wizardCursor: z.string().optional(),
  })
  .superRefine((lead, ctx) => {
    if (MIGRATION_REQUIRED.has(lead.engagement.buildType) && !lead.migration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['migration'],
        message: `migration block is required when buildType is "${lead.engagement.buildType}"`,
      });
    }
  });

export type Vibe = z.infer<typeof VibeEnum>;
export type Section = z.infer<typeof SectionEnum>;
export type LeadStatus = z.infer<typeof LeadStatusEnum>;
export type BuildType = z.infer<typeof BuildTypeEnum>;
export type EngagementType = z.infer<typeof EngagementTypeEnum>;
export type UrgencyTier = z.infer<typeof UrgencyTierEnum>;
export type Integration = z.infer<typeof IntegrationEnum>;
export type Compliance = z.infer<typeof ComplianceEnum>;
export type Localization = z.infer<typeof LocalizationEnum>;
export type DomainStatus = z.infer<typeof DomainStatusEnum>;
export type PriorPlatform = z.infer<typeof PriorPlatformEnum>;
export type SeoContinuity = z.infer<typeof SeoContinuityEnum>;
export type ContentCopy = z.infer<typeof ContentCopyEnum>;
export type ContentPhotos = z.infer<typeof ContentPhotosEnum>;
export type ContentLogo = z.infer<typeof ContentLogoEnum>;
export type HistoryKind = z.infer<typeof HistoryKindEnum>;
export type ProvisioningStepStatus = z.infer<typeof ProvisioningStepStatusEnum>;
export type ProvisioningOverallStatus = z.infer<typeof ProvisioningOverallStatusEnum>;
export type ProvisioningMode = z.infer<typeof ProvisioningModeEnum>;
export type Signature = z.infer<typeof SignatureEnum>;
export type LayoutShell = z.infer<typeof LayoutShellEnum>;

export type Service = z.infer<typeof ServiceSchema>;
export type BusinessInfo = z.infer<typeof BusinessInfoSchema>;
export type Animations = z.infer<typeof AnimationsSchema>;
export type MultiTonePalette = z.infer<typeof MultiTonePaletteSchema>;
export type Typography = z.infer<typeof TypographySchema>;
export type DesignTokens = z.infer<typeof DesignTokensSchema>;
export type AssetRef = z.infer<typeof AssetRefSchema>;
export type Assets = z.infer<typeof AssetsSchema>;
export type Layout = z.infer<typeof LayoutSchema>;
export type SiteDNA = z.infer<typeof SiteDNASchema>;
export type Engagement = z.infer<typeof EngagementSchema>;
export type Context = z.infer<typeof ContextSchema>;
export type Domain = z.infer<typeof DomainSchema>;
export type Migration = z.infer<typeof MigrationSchema>;
export type ContentReadiness = z.infer<typeof ContentReadinessSchema>;
export type ProvisioningStep = z.infer<typeof ProvisioningStepSchema>;
export type Provisioning = z.infer<typeof ProvisioningSchema>;
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;
export type LeadRecord = z.infer<typeof LeadRecordSchema>;

export const MIGRATION_REQUIRED_BUILD_TYPES = MIGRATION_REQUIRED;
