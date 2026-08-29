import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import {
  BASE_ANGLES,
  BASE_RADII,
  BLOB_VIEWBOX,
  buildBlobPath,
} from '../utils/blobPath';

const BULGE = 0.09; // how far an anchor swells toward the cursor, normalized
const SMOOTHING = 0.12; // per-frame lerp factor - lower is more fluid lag
const INFLUENCE_MULT = 1.9; // reacts up to ~1.9x the element's own size away

// Glow opacity at rest and at closest approach. Deliberately restrained: the
// halo should read as ambient light behind the photo, not a highlight ring.
const GLOW_MIN = 0.26;
const GLOW_MAX = 0.52;

// How far outside the viewBox the gradient's focus may travel, in user units.
const HOTSPOT_CLAMP = 26;

/**
 * Drives the instructor photo's mask and its halo from one cursor-proximity
 * signal, computed once per frame:
 *  - anchor points on the blob facing the cursor swell outward
 *  - the halo brightens as the cursor nears, and its gradient focus slides
 *    toward the cursor so the brightening is LOCAL to that side rather than
 *    a uniform lift across the whole halo
 *
 * The mask path and the glow path receive the same `d` string from a single
 * buildBlobPath call, so the silhouette and its halo are always the same
 * shape by construction.
 *
 * Runs a persistent rAF loop rather than reacting only to pointermove, so
 * both keep easing back to rest after the pointer stops or leaves - a
 * one-shot handler would jump once and then sit there. Disabled under
 * reduced motion and on coarse-pointer devices, matching the rest of the
 * site's cursor-driven effects.
 */
export function useReactivePhoto({
  wrapRef,
  maskPathRef,
  glowPathRef,
  glowGradientRef,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const pointerRef = useRef({ x: null, y: null });
  const currentRadii = useRef([...BASE_RADII]);
  const currentGlow = useRef(GLOW_MIN);
  const currentFocus = useRef({ x: BLOB_VIEWBOX / 2, y: BLOB_VIEWBOX / 2 });

  useEffect(() => {
    if (reducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (!wrapRef.current || !maskPathRef.current) return;

    const onMove = (e) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const half = BLOB_VIEWBOX / 2;
    let frame;

    const tick = () => {
      const wrap = wrapRef.current;
      const maskPath = maskPathRef.current;
      const glowPath = glowPathRef.current;
      const gradient = glowGradientRef.current;

      if (!wrap || !maskPath) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const { x, y } = pointerRef.current;
      let targetRadii = BASE_RADII;
      let targetGlow = GLOW_MIN;
      let targetFocusX = half;
      let targetFocusY = half;

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

        // Cursor in viewBox units, clamped so the focus can reach the rim
        // without flying off. Eased back toward centre by proximity, so a
        // distant pointer leaves a symmetric halo rather than a hotspot
        // pinned to one edge.
        const vx = ((x - rect.left) / rect.width) * BLOB_VIEWBOX;
        const vy = ((y - rect.top) / rect.height) * BLOB_VIEWBOX;
        const clamp = (v) =>
          Math.min(BLOB_VIEWBOX + HOTSPOT_CLAMP, Math.max(-HOTSPOT_CLAMP, v));
        targetFocusX = half + (clamp(vx) - half) * proximity;
        targetFocusY = half + (clamp(vy) - half) * proximity;

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

      if (pathChanged) {
        // One build, both consumers: silhouette and halo cannot diverge.
        const d = buildBlobPath(radii, BLOB_VIEWBOX);
        maskPath.setAttribute('d', d);
        if (glowPath) glowPath.setAttribute('d', d);
      }

      if (glowPath) {
        currentGlow.current += (targetGlow - currentGlow.current) * SMOOTHING;
        glowPath.setAttribute('opacity', currentGlow.current.toFixed(3));
      }

      if (gradient) {
        const focus = currentFocus.current;
        focus.x += (targetFocusX - focus.x) * SMOOTHING;
        focus.y += (targetFocusY - focus.y) * SMOOTHING;
        gradient.setAttribute('cx', focus.x.toFixed(2));
        gradient.setAttribute('cy', focus.y.toFixed(2));
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion, wrapRef, maskPathRef, glowPathRef, glowGradientRef]);
}
