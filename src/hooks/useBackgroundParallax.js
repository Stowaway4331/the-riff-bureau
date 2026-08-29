import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Drifts a section's backdrop image against the page as the section passes
 * through the viewport.
 *
 * The travel is expressed in yPercent (a share of the layer's own height)
 * rather than pixels, so a short section and a tall one drift by the same
 * visual proportion instead of the tall one barely moving. It must stay
 * below the layer's overscan — see the note on --backdrop-overscan in
 * sectionBackdrop.css — or the layer's edge would scroll into view and
 * expose the flat background behind it.
 *
 * Scrubbed across the section's full passage (`top bottom` to `bottom top`)
 * with a linear ease, which is what keeps the drift proportional to scroll
 * rather than easing in and out mid-section.
 */
export function useBackgroundParallax(layerRef, triggerRef, { travel = 9 } = {}) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const layer = layerRef.current;
    const trigger = triggerRef.current;
    if (!layer || !trigger || reducedMotion) return;

    // Left untransformed under reduced motion, which is exactly the centred
    // resting position the CSS already paints.
    const tween = gsap.fromTo(
      layer,
      { yPercent: -travel },
      {
        yPercent: travel,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(layer, { clearProps: 'transform' });
    };
  }, [layerRef, triggerRef, travel, reducedMotion]);
}
