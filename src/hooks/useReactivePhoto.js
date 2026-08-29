import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { BASE_ANGLES, BASE_RADII, buildBlobPath } from '../utils/blobPath';

const BULGE = 0.09; // how far an anchor can swell toward the cursor, in normalized units
const SMOOTHING = 0.12; // per-frame lerp factor — lower = more fluid lag
const INFLUENCE_MULT = 1.9; // reacts up to ~1.9x the element's own size away
const GLOW_MIN = 0.4; // resting glow opacity — must match the fallback in instructor.css
const GLOW_MAX = 1;

/**
 * Ties both the blob mask and the glow behind the instructor photo to one
 * cursor-proximity signal, computed once per frame:
 *  - anchor points on the blob path facing the cursor swell outward
 *  - the glow's intensity rises as the cursor gets closer
 *
 * Runs a persistent rAF loop rather than only reacting to pointermove, so
 * both keep easing back to rest after the pointer stops moving or leaves —
 * a one-shot event handler would snap once and then just sit there.
 * Disabled under reduced motion and on coarse-pointer (touch) devices,
 * matching the rest of the site's cursor-driven effects.
 */
export function useReactivePhoto(wrapRef, pathRef, glowRef) {
  const reducedMotion = usePrefersReducedMotion();
  const pointerRef = useRef({ x: null, y: null });
  const currentRadii = useRef([...BASE_RADII]);
  const currentGlow = useRef(GLOW_MIN);

  useEffect(() => {
    if (reducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (!wrapRef.current || !pathRef.current) return;

    const onMove = (e) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let frame;
    const tick = () => {
      const wrap = wrapRef.current;
      const path = pathRef.current;
      const glow = glowRef.current;

      if (!wrap || !path) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const { x, y } = pointerRef.current;
      let targetRadii = BASE_RADII;
      let targetGlow = GLOW_MIN;

      if (x !== null) {
        const rect = wrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);
        const maxDist = Math.max(rect.width, rect.height) * INFLUENCE_MULT;
        const proximity = Math.max(0, 1 - dist / maxDist);

        targetGlow = GLOW_MIN + (GLOW_MAX - GLOW_MIN) * proximity;

        if (proximity > 0) {
          const cursorAngle = Math.atan2(dy, dx);
          targetRadii = BASE_ANGLES.map((deg, i) => {
            const anchorAngle = (deg * Math.PI) / 180;
            const closeness = (Math.cos(anchorAngle - cursorAngle) + 1) / 2;
            return BASE_RADII[i] + BULGE * proximity * closeness;
          });
        }
      }

      const radii = currentRadii.current;
      let pathChanged = false;
      for (let i = 0; i < radii.length; i++) {
        const next = radii[i] + (targetRadii[i] - radii[i]) * SMOOTHING;
        if (Math.abs(next - radii[i]) > 0.0002) pathChanged = true;
        radii[i] = next;
      }
      if (pathChanged) path.setAttribute('d', buildBlobPath(radii));

      if (glow) {
        currentGlow.current += (targetGlow - currentGlow.current) * SMOOTHING;
        glow.style.opacity = currentGlow.current.toFixed(3);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion, wrapRef, pathRef, glowRef]);
}
