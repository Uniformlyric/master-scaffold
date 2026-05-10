/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--fp-bg)',
        surface: 'var(--fp-surface)',
        accent: 'var(--fp-accent)',
        ink: 'var(--fp-ink)',
        muted: 'var(--fp-muted)',
      },
      fontFamily: {
        display: ['var(--fp-font-display)'],
        body: ['var(--fp-font-body)'],
      },
    },
  },
  plugins: [],
};
