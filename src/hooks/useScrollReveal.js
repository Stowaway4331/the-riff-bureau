import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Fades a batch of elements up as each individually crosses into the
 * viewport, rather than all at once (ScrollTrigger.batch, not one trigger
 * per section). Skips entirely under reduced motion, rendering the final
 * state immediately — the same contract the rest of the site's motion
 * follows (see the hero reveal and cursor accents).
 *
 * `scopeRef` is the section's root ref; `selector` is queried within it once
 * on mount. All content this targets is below the fold at load, so a plain
 * `useEffect` (rather than `useLayoutEffect`) is fine — there is nothing to
 * flash before paint.
 */
export function useScrollReveal(scopeRef, selector, options = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const { y = 28, stagger = 0.12, duration = 0.7, start = 'top 88%' } = options;

  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;

    const targets = root.querySelectorAll(selector);
    if (!targets.length) return;

    if (reducedMotion) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(targets, { opacity: 0, y });

    const triggers = ScrollTrigger.batch(targets, {
      start,
      once: true,
      onEnter: (els) =>
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: 'power2.out',
          overwrite: true,
        }),
    });

    return () => triggers.forEach((st) => st.kill());
  }, [scopeRef, selector, reducedMotion, y, stagger, duration, start]);
}
