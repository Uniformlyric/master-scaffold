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
};

export function typographyForVibe(vibe: Vibe): Typography {
  return TYPOGRAPHY_BY_VIBE[vibe];
}

export const GOOGLE_FONTS_HREF_BY_VIBE: Readonly<Record<Vibe, string>> = {
  'The Bold':
    'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;700&display=swap',
  'The Professional':
    'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Inter:wght@400;500;700&display=swap',
  'The Modern':
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap',
};
