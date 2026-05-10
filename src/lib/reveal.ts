/*
 * Tiny IntersectionObserver utility for reveal-on-scroll.
 *
 * Tag any element with `data-reveal` to fade/slide it in once it scrolls into
 * view. The observer toggles `data-revealed="true"`; the actual transition is
 * defined in src/styles/global.css and respects prefers-reduced-motion.
 */
export function initReveal(): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    document
      .querySelectorAll<HTMLElement>('[data-reveal]')
      .forEach((el) => el.setAttribute('data-revealed', 'true'));
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');

  if (reduceMotion) {
    targets.forEach((el) => el.setAttribute('data-revealed', 'true'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-revealed', 'true');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
  );

  targets.forEach((el) => io.observe(el));
}
