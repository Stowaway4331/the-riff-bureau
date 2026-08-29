import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Drives registered elements from pointer position. The quickTo setters are
 * built once per element — building them inside the move handler allocates
 * two tweens per element per event and stalls the main thread.
 */
export function usePointerParallax() {
  const elementsRef = useRef(new Set());
  const reducedMotion = usePrefersReducedMotion();

  const register = useCallback((el) => {
    if (el) elementsRef.current.add(el);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const setters = [...elementsRef.current].map((el) => ({
      depth: Number(el.dataset.maxOffset) || 8,
      x: gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' }),
    }));

    if (!setters.length) return;

    let frame = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      frame = 0;
      for (const s of setters) {
        s.x(px * s.depth);
        s.y(py * s.depth * 0.5);
      }
    };

    // Coalesce to one write per frame — pointermove can fire faster than paint.
    const onMove = (e) => {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return { register };
}
