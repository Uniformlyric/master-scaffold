import type { Typography, Vibe } from './zod.js';

const SYSTEM_SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const TYPOGRAPHY_BY_VIBE: Readonly<Record<Vibe, Typography>> = {
  'The Bold': {
    headingStack: `"Archivo Black", ${SYSTEM_SANS}`,
    bodyStack: `Inter, ${SYSTEM_SANS}`,
    borderRadius: '0px',
    borderWidth: '2px',
    letterSpacing: '-0.01em',
  },
  'The Professional': {
    headingStack: `"Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif`,
    bodyStack: `Inter, ${SYSTEM_SANS}`,
    borderRadius: '8px',
    borderWidth: '1px',
    letterSpacing: '0',
  },
  'The Modern': {
    headingStack: `"Plus Jakarta Sans", ${SYSTEM_SANS}`,
    bodyStack: `"Plus Jakarta Sans", ${SYSTEM_SANS}`,
    borderRadius: '24px',
    borderWidth: '0px',
    letterSpacing: '-0.005em',
  },
  'The Artisan': {
    headingStack: `"Fraunces", Georgia, "Times New Roman", serif`,
    bodyStack: `Inter, ${SYSTEM_SANS}`,
    borderRadius: '4px',
    borderWidth: '1px',
    letterSpacing: '0',
  },
  'The Wellness': {
    headingStack: `"Quicksand", ${SYSTEM_SANS}`,
    bodyStack: `Nunito, ${SYSTEM_SANS}`,
    borderRadius: '16px',
    borderWidth: '1px',
    letterSpacing: '0',
  },
  'The Editorial': {
    headingStack: `"Playfair Display", Georgia, "Times New Roman", serif`,
    bodyStack: `Inter, ${SYSTEM_SANS}`,
    borderRadius: '0px',
    borderWidth: '1px',
    letterSpacing: '-0.01em',
  },
  'The Luxe': {
    headingStack: `"Cormorant Garamond", "Cormorant", Georgia, serif`,
    bodyStack: `Lato, ${SYSTEM_SANS}`,
    borderRadius: '2px',
    borderWidth: '1px',
    letterSpacing: '0.02em',
  },
  'The Tech': {
    headingStack: `"Space Grotesk", ${SYSTEM_SANS}`,
    bodyStack: `Inter, ${SYSTEM_SANS}`,
    borderRadius: '12px',
    borderWidth: '1px',
    letterSpacing: '-0.01em',
  },
  'The Heritage': {
    headingStack: `"Crimson Pro", "Crimson Text", Georgia, serif`,
    bodyStack: `"Source Sans 3", "Source Sans Pro", ${SYSTEM_SANS}`,
    borderRadius: '4px',
    borderWidth: '1px',
    letterSpacing: '0',
  },
};

export function typographyForVibe(vibe: Vibe): Typography {
  return TYPOGRAPHY_BY_VIBE[vibe];
}

export const GOOGLE_FONTS_HREF_BY_VIBE: Readonly<Record<Vibe, string>> = {
  'The Bold':
    'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&display=swap',
  'The Professional':
    'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap',
  'The Modern':
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
  'The Artisan':
    'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap',
  'The Wellness':
    'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap',
  'The Editorial':
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap',
  'The Luxe':
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Lato:wght@400;700&display=swap',
  'The Tech':
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap',
  'The Heritage':
    'https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&display=swap',
};
