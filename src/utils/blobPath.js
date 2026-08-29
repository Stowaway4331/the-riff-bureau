const TENSION = 6;

/** User-space size the instructor mask is drawn in (its SVG viewBox). */
export const BLOB_VIEWBOX = 100;

// 8 anchor points around a circle, jittered radii for an organic, asymmetric
// "paint splash" silhouette (not a recognizable object). Normalized to
// objectBoundingBox space (0..1) so the shape scales with the element
// regardless of its rendered size.
export const BASE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/*
 * Radii are kept in a fairly narrow band - deep indentations between anchors
 * cost a lot of area for very little extra character, so raising the minimums
 * fills the shape out while the outer extent barely moves.
 *
 * The 180deg (leftward) radius is deliberately the smallest of the group. The
 * subject sits at ~38% across the source photo, so the image rect has to be
 * shifted right to centre them, and it is the mask's LEFTWARD reach that then
 * decides how large that rect must be. Growing every other direction is
 * effectively free; growing this one directly raises the zoom and crops away
 * more of the photo. Bear that asymmetry in mind before editing.
 */
export const BASE_RADII = [0.53, 0.49, 0.54, 0.46, 0.47, 0.45, 0.53, 0.48];

function catmullRomToBezier(p0, p1, p2, p3) {
  return [
    p1.x + (p2.x - p0.x) / TENSION,
    p1.y + (p2.y - p0.y) / TENSION,
    p2.x - (p3.x - p1.x) / TENSION,
    p2.y - (p3.y - p1.y) / TENSION,
  ];
}

/**
 * Smooth closed blob outline through `radii` (one per BASE_ANGLES entry),
 * via Catmull-Rom-to-Bezier conversion. Used both for the resting mask
 * shape and, in useReactivePhoto, for every frame of the cursor-driven
 * deformation — kept in one place so the two can never drift apart.
 *
 * `scale` maps the normalized 0..1 geometry into whatever user space the
 * consumer needs. The instructor mask passes BLOB_VIEWBOX so the path lands
 * in the SVG's own viewBox units, letting the clipPath use the default
 * userSpaceOnUse rather than objectBoundingBox.
 */
export function buildBlobPath(radii, scale = 1) {
  const n = BASE_ANGLES.length;
  const pts = BASE_ANGLES.map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: (0.5 + radii[i] * Math.cos(rad)) * scale,
      y: (0.5 + radii[i] * Math.sin(rad)) * scale,
    };
  });

  let d = `M ${pts[0].x.toFixed(4)} ${pts[0].y.toFixed(4)} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const [c1x, c1y, c2x, c2y] = catmullRomToBezier(p0, p1, p2, p3);
    d += `C ${c1x.toFixed(4)} ${c1y.toFixed(4)} ${c2x.toFixed(4)} ${c2y.toFixed(4)} ${p2.x.toFixed(4)} ${p2.y.toFixed(4)} `;
  }
  return `${d}Z`;
}
