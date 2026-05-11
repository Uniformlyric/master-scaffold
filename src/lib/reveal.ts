/*
 * Reveal-on-scroll + Heavy Drift parallax driver for the Nuzum Method signature.
 *
 * - `[data-reveal]` elements fade/slide in once they enter the viewport.
 *   The observer toggles `data-revealed="true"`; the actual transition is
 *   defined in src/styles/global.css and respects prefers-reduced-motion.
 *
 * - `[data-drift]` elements get a scroll-driven translateY so they move at
 *   slightly different speeds than the surrounding text. Two intensities:
 *     data-drift="slow"  -> 0.6x viewport speed (lazy weight)
 *     data-drift="fast"  -> 0.8x viewport speed (still lazy, just less so)
 *   Reduced motion + small viewport (<=480px) collapse to no drift.
 *
 * Both drivers are idempotent: calling initReveal() twice is a no-op.
 */

const REVEAL_INIT_FLAG = '__nmRevealInitialized';
const DRIFT_INIT_FLAG = '__nmDriftInitialized';

declare global {
  interface Window {
    [REVEAL_INIT_FLAG]?: boolean;
    [DRIFT_INIT_FLAG]?: boolean;
  }
}

export function initReveal(): void {
  if (typeof window === 'undefined') return;
  initRevealObserver();
  initDriftDriver();
}

function initRevealObserver(): void {
  if (window[REVEAL_INIT_FLAG]) return;
  window[REVEAL_INIT_FLAG] = true;

  if (!('IntersectionObserver' in window)) {
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

interface DriftEntry {
  el: HTMLElement;
  factor: number;
  baseOffset: number;
}

function initDriftDriver(): void {
  if (window[DRIFT_INIT_FLAG]) return;
  window[DRIFT_INIT_FLAG] = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tooNarrow = window.matchMedia('(max-width: 480px)').matches;
  if (reduceMotion || tooNarrow) return;

  const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-drift]'));
  if (nodes.length === 0) return;

  const entries: DriftEntry[] = nodes.map((el) => {
    const intensity = el.getAttribute('data-drift') ?? 'slow';
    const factor =
      intensity === 'fast' ? 0.2 : intensity === 'slow' ? 0.12 : 0.16; // negative = upward drift
    return { el, factor, baseOffset: 0 };
  });

  let viewportH = window.innerHeight;
  let pending = false;

  const update = () => {
    pending = false;
    const vh = viewportH;
    for (const { el, factor } of entries) {
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const offsetFromViewportCenter = elCenter - vh / 2;
      const translate = -offsetFromViewportCenter * factor;
      el.style.transform = `translate3d(0, ${translate.toFixed(2)}px, 0)`;
    }
  };

  const onScroll = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(update);
  };

  const onResize = () => {
    viewportH = window.innerHeight;
    onScroll();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  update();
}
