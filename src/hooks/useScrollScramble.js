import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Ties each registered element to a small Lissajous-style wobble around its
 * resting position, driven off scroll progress across the whole document via
 * a single scrubbed ScrollTrigger. Because the offset is a deterministic
 * function of scroll progress (not time), scrolling back up plays the motion
 * in reverse exactly, which is what makes this a scrub rather than a
 * scroll-triggered one-shot.
 *
 * Distinct per-element frequency and phase keep the registered elements from
 * ever moving in sync — that desynchronisation is what reads as "scrambling"
 * rather than a single shared drift. Amplitude is kept small (a few percent
 * of viewport) so it stays a wobble around each anchor point rather than a
 * sweep across the screen.
 */
export function useScrollScramble() {
  const itemsRef = useRef([]);
  const reducedMotion = usePrefersReducedMotion();

  const register = (el, params) => {
    if (!el || !params) return;
    if (itemsRef.current.some((item) => item.el === el)) return;
    itemsRef.current.push({ el, params });
  };

  useEffect(() => {
    if (reducedMotion || !itemsRef.current.length) return;

    const setters = itemsRef.current.map(({ el, params }) => ({
      params,
      setX: gsap.quickSetter(el, 'x', 'px'),
      setY: gsap.quickSetter(el, 'y', 'px'),
    }));

    const apply = (progress) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const angle = progress * Math.PI * 2;

      for (const { params, setX, setY } of setters) {
        const x =
          Math.sin(angle * params.freqX + params.phase) *
          (params.ampX / 100) *
          vw;
        const y =
          Math.cos(angle * params.freqY + params.phase * 1.3) *
          (params.ampY / 100) *
          vh;
        setX(x);
        setY(y);
      }
    };

    apply(0);

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
      invalidateOnRefresh: true,
      onUpdate: (self) => apply(self.progress),
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  return { register };
}
