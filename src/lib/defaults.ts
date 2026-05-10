/*
 * Smart defaults for sparse wizard runs.
 *
 * Each helper returns convincing, vibe-appropriate placeholder content derived
 * from the lead's businessInfo. Sections call `realOrDefault*` to use real
 * data when present, defaults otherwise.
 *
 * All defaults are STABLE across builds (no random RNG) so a given lead
 * always renders the same content.
 */

import type { BusinessInfo, Service, Vibe } from '../site-dna/index.js';

interface PricingTier {
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
  ctaLabel: string;
  highlight?: boolean;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

interface ReviewBadge {
  platform: string;
  score: number;
  count: string;
  label: string;
}

interface ValueProp {
  title: string;
  blurb: string;
  icon: 'shield' | 'sparkle' | 'bolt' | 'leaf' | 'medal' | 'clock';
}

interface FAQ {
  q: string;
  a: string;
}

interface ContactInfo {
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  hours: string;
  address: string;
  socials: { label: string; href: string }[];
}

function businessName(info: BusinessInfo): string {
  return info.name?.trim() || 'Your Business';
}

function shortName(info: BusinessInfo): string {
  const n = businessName(info).split(/\s+/);
  return n.slice(0, 2).join(' ');
}

export function defaultServices(info: BusinessInfo): Service[] {
  const name = businessName(info);
  return [
    {
      title: 'Consultation & Estimate',
      description: `Walk through your project with a ${name} expert and get a clear, written estimate within 24 hours.`,
      priceLabel: 'Free',
    },
    {
      title: 'Standard Service',
      description: 'Our most-booked offering, delivered on schedule by a certified, insured team.',
      priceLabel: 'From $199',
    },
    {
      title: 'Premium Package',
      description: 'White-glove handling end-to-end with priority scheduling and a written satisfaction guarantee.',
      priceLabel: 'Custom Quote',
    },
  ];
}

export function realOrDefaultServices(info: BusinessInfo): Service[] {
  const real = (info.services ?? []).filter((s) => s.title?.trim());
  if (real.length >= 3) return real;
  if (real.length === 0) return defaultServices(info);
  return [...real, ...defaultServices(info).slice(real.length)];
}

export function defaultPricingTiers(info: BusinessInfo, services: Service[] = []): PricingTier[] {
  const anchor = services.find((s) => s.priceLabel?.trim());
  const fallbackName = anchor?.title ?? 'Service';
  const anchorPrice = anchor?.priceLabel?.trim() ?? '$199';

  return [
    {
      name: 'Starter',
      priceLabel: anchorPrice.startsWith('$') ? anchorPrice : `${anchorPrice}+`,
      description: `Get the basics handled fast. Ideal for first-time clients trying ${businessName(info)}.`,
      features: [
        `Single ${fallbackName.toLowerCase()} session`,
        'Up-front quote, no surprises',
        'Same-week scheduling',
        '30-day satisfaction guarantee',
      ],
      ctaLabel: 'Book Starter',
    },
    {
      name: 'Standard',
      priceLabel: 'Most Popular',
      description: 'Our most-booked plan. Best value for ongoing or larger projects.',
      features: [
        `Everything in Starter`,
        'Priority scheduling within 48 hours',
        'Quarterly check-ins included',
        'Dedicated point of contact',
        'Premium materials & finishes',
      ],
      ctaLabel: 'Book Standard',
      highlight: true,
    },
    {
      name: 'Premium',
      priceLabel: 'Custom',
      description: 'White-glove service with bespoke planning. Quote tailored to your scope.',
      features: [
        'Everything in Standard',
        'Same-day emergency response',
        'Annual maintenance plan',
        'Written satisfaction guarantee',
        'On-site project manager',
      ],
      ctaLabel: 'Get a Quote',
    },
  ];
}

export function defaultTestimonials(info: BusinessInfo): Testimonial[] {
  const name = businessName(info);
  return [
    {
      quote: `${name} showed up on time, finished early, and the result is genuinely better than I imagined. This is the team to call.`,
      name: 'Maya R.',
      role: 'Verified customer',
      initials: 'MR',
    },
    {
      quote: 'Honest, upfront pricing and they cleaned up after themselves. We will absolutely use them again.',
      name: 'Devon K.',
      role: 'Repeat client',
      initials: 'DK',
    },
    {
      quote: 'Saved my project at the last minute. Professional from the first call to the final invoice.',
      name: 'Priya S.',
      role: 'Verified customer',
      initials: 'PS',
    },
  ];
}

export function defaultReviewBadges(_info: BusinessInfo): ReviewBadge[] {
  return [
    { platform: 'Google', score: 4.9, count: '200+', label: '4.9 on Google' },
    { platform: 'Yelp', score: 5.0, count: '80+', label: '5.0 on Yelp' },
    { platform: 'Angi', score: 5.0, count: 'Top Pro', label: 'Top Pro on Angi' },
    { platform: 'BBB', score: 5.0, count: 'A+', label: 'BBB A+ Accredited' },
  ];
}

export function defaultValueProps(info: BusinessInfo): ValueProp[] {
  return [
    {
      icon: 'bolt',
      title: 'Fast turnaround',
      blurb: `Most ${businessName(info)} jobs are scoped, scheduled, and finished within a single week.`,
    },
    {
      icon: 'shield',
      title: 'Fully licensed & insured',
      blurb: 'Every project is backed by full liability coverage and a written workmanship guarantee.',
    },
    {
      icon: 'medal',
      title: 'Hundreds of 5-star reviews',
      blurb: 'Real verified reviews from neighbors. We earn trust the old-fashioned way: by showing up.',
    },
  ];
}

export function defaultFAQs(info: BusinessInfo): FAQ[] {
  const name = businessName(info);
  return [
    {
      q: `How quickly can ${name} get started?`,
      a: 'Most new clients are scheduled within 48 hours. Emergency response is available the same day for existing clients.',
    },
    {
      q: 'Do you offer free quotes?',
      a: 'Yes. Initial consultations and written estimates are always free, with zero obligation to book.',
    },
    {
      q: 'What areas do you serve?',
      a: 'We serve the greater metro area within a 30-mile radius. Outside that range, please reach out for a custom travel quote.',
    },
    {
      q: 'Are you licensed and insured?',
      a: 'Absolutely. Full credentials are available on request, and every project is covered by our liability and workmanship guarantee.',
    },
    {
      q: 'What forms of payment do you accept?',
      a: 'Card, ACH, check, and approved financing through our partner network. A deposit secures your appointment.',
    },
    {
      q: 'Do you stand behind your work?',
      a: `Every ${name} job ships with a written satisfaction guarantee. If anything is not right, we make it right.`,
    },
  ];
}

export function defaultContactInfo(info: BusinessInfo): ContactInfo {
  return {
    phone: '(555) 123-4567',
    phoneHref: 'tel:+15551234567',
    email: `hello@${slug(businessName(info))}.com`,
    emailHref: `mailto:hello@${slug(businessName(info))}.com`,
    hours: 'Mon-Fri 8am-6pm  ·  Sat 9am-2pm',
    address: 'Serving the greater metro area',
    socials: [
      { label: 'Instagram', href: '#' },
      { label: 'Facebook', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  };
}

export function defaultTagline(info: BusinessInfo): string {
  return info.tagline?.trim() || 'Trusted Local Experts';
}

export function defaultValueProp(info: BusinessInfo): string {
  return (
    info.valueProp?.trim() ||
    `${businessName(info)} delivers reliable, high-quality service backed by hundreds of five-star reviews. Get a free quote today.`
  );
}

export function defaultHeroHeadline(info: BusinessInfo): string {
  return businessName(info);
}

export function defaultHeroEyebrow(info: BusinessInfo, vibe: Vibe): string {
  if (info.tagline?.trim()) return info.tagline.trim();
  switch (vibe) {
    case 'The Bold': return 'BOLD WORK. PROVEN RESULTS.';
    case 'The Professional': return 'Trusted Since Day One';
    case 'The Modern': return 'Modern Service, Local Hands';
    case 'The Artisan': return 'Crafted by Hand, Built to Last';
    case 'The Wellness': return 'Restoration Begins Here';
    case 'The Editorial': return 'Featured Work';
    case 'The Luxe': return 'Discreet. Refined. Exceptional.';
    case 'The Tech': return 'Engineered for the Way You Work';
    case 'The Heritage': return 'A Legacy of Quality Service';
    default: return 'Trusted Local Experts';
  }
}

export function businessInitials(info: BusinessInfo): string {
  const words = businessName(info).split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function trustMicroRow(info: BusinessInfo) {
  return {
    rating: '4.9',
    reviews: '200+ reviews',
    years: '10+ years',
    jobs: '1,200+ jobs completed',
    biz: shortName(info),
  };
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'business';
}

export type {
  PricingTier,
  Testimonial,
  ReviewBadge,
  ValueProp,
  FAQ,
  ContactInfo,
};
