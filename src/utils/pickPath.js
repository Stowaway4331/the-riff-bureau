/*
 * Guitar-pick outline, kept as raw command data rather than a path string so
 * it can be emitted at any size. The toggle needs the SAME silhouette twice,
 * in two coordinate systems that cannot be shared:
 *
 *   - as an SVG `d` in the 0..PICK_VIEWBOX viewBox, for the orange outline
 *   - as a CSS `clip-path: path()` in the button's PIXEL space, for the
 *     backdrop-blurred fill behind the bars
 *
 * CSS `path()` has no viewBox and no unit scaling - its numbers are always
 * px in the element's own box - so the shape has to be re-emitted at the
 * button's pixel size. Generating both from one source is what stops the
 * outline and the blurred fill from drifting apart; the alternative,
 * `clip-path: url(#id)` with objectBoundingBox units, is the fragile interop
 * route that made the instructor photo vanish (see Instructor.jsx).
 */

/** Coordinate space the commands below are authored in. */
export const PICK_VIEWBOX = 100;

// Taken verbatim from public/guitar-pick.svg: ten cubic segments traced from
// the reference outline, drawn anticlockwise from the tip. Spans x
// 10.57..89.43 and y 4..96 - aspect 0.857, so it is taller than it is wide
// and sits inset in a square box. A few control points fall outside the
// viewBox; that is fine, they are off-curve and the curve itself does not.
const PICK_COMMANDS = [
  ['M', 49.74, 96],
  ['C', 45.44, 95.89, 42.04, 92.51, 39.34, 89.52],
  ['C', 33.24, 82.78, 28.19, 75.25, 23.69, 67.36],
  ['C', 14.15, 50.61, -0.13, 22.54, 23.3, 10.03],
  ['C', 27.19, 7.95, 31.46, 6.56, 35.75, 5.57],
  ['C', 41.14, 4.33, 46.69, 3.87, 52.21, 4.03],
  ['C', 57.5, 4.18, 62.81, 5.04, 67.89, 6.52],
  ['C', 71.68, 7.63, 75.47, 9.11, 78.79, 11.27],
  ['C', 99.66, 24.87, 84.98, 52.29, 75.7, 68.34],
  ['C', 71.26, 76.01, 66.3, 83.33, 60.3, 89.87],
  ['C', 57.56, 92.86, 54.09, 96.11, 49.74, 96],
  ['Z'],
];

/**
 * @param {number} size edge length of the square the pick is drawn in.
 * @returns {string} path data, usable as an SVG `d` or inside CSS `path()`.
 */
export function buildPickPath(size = PICK_VIEWBOX) {
  const scale = size / PICK_VIEWBOX;

  return PICK_COMMANDS.map(([command, ...values]) =>
    values.length
      ? command + values.map((v) => +(v * scale).toFixed(3)).join(' ')
      : command
  ).join(' ');
}
