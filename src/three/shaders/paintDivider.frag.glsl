uniform sampler2D uNoise;
uniform float uProgress;
uniform float uSoftness;
uniform vec2 uNoiseScale;
uniform vec2 uBristleScale;

varying vec2 vUv;

/* NOTE: keep this file pure ASCII. The WebGL spec restricts shader source to
   the GLSL ES character set and requires compilation to fail on anything
   outside it, comments included. A stray typographic dash or quote here is
   enough to make the whole shader fail to compile.

   Geometry is a centre line plus a half-width, so the stroke can swell and
   taper along its length. Values are the original 0.16W-plane constants
   scaled by 0.16/0.30; the plane was widened to 0.30W so the leftward curve
   finishes without being cut flat by the plane border. */
const float STROKE_CENTRE = 0.561333;
const float HALF_WIDTH    = 0.141700;
const float CURVE         = 0.224000;
const float WOBBLE_A      = 0.026667;
const float WOBBLE_B      = 0.010667;
const float GRAIN         = 0.074667;
const float EDGE_OUTER    = 0.053333;
const float EDGE_INNER    = 0.010667;
const float RAGGED        = 0.037333;
const float WAIST_DEPTH   = 0.300000;
const float PI            = 3.141593;

void main() {
  // Big, slow curls from the domain-warped field.
  float flow = texture2D(uNoise, vUv * uNoiseScale).r;
  // Fine streaks stretched along the stroke: reads as bristle marks.
  float bristle = texture2D(uNoise, vUv * uBristleScale).r;

  // The stroke leans left as it descends, bending most near the bottom.
  float curve = pow(1.0 - vUv.y, 1.6) * CURVE;

  float wobble = sin(vUv.y * 3.0) * WOBBLE_A + sin(vUv.y * 7.0) * WOBBLE_B;
  float grain = (flow - 0.5) * GRAIN;

  float centre = STROKE_CENTRE + wobble + grain - curve;

  // Width profile: wide where the brush lands and again where it drags off,
  // waisted through the middle. sin() is zero at both ends and one at the
  // centre, so it only ever subtracts width from the middle. Raising vUv.y to
  // 0.85 skews the narrowest point to about y=0.44, just below centre, so the
  // waist does not sit mechanically dead-centre.
  float waist = pow(sin(PI * pow(vUv.y, 0.85)), 1.4);
  float halfWidth = HALF_WIDTH * (1.0 - WAIST_DEPTH * waist);

  // Bristles roughen both edges together, as a real ferrule would.
  float edgeJitter = (bristle - 0.5) * 0.035;
  float leftEdge = centre - halfWidth + edgeJitter;
  float rightEdge = centre + halfWidth + edgeJitter;

  float stroke = smoothstep(leftEdge - EDGE_OUTER, leftEdge + EDGE_INNER, vUv.x)
               * (1.0 - smoothstep(rightEdge - EDGE_INNER, rightEdge + EDGE_OUTER, vUv.x));

  // Uneven paint load: broad flow variation plus finer bristle streaking.
  stroke *= 0.60 + flow * 0.44 + bristle * 0.22;

  // Draw top to bottom with a ragged trailing edge. Remapped to start beyond
  // the ragged top and finish beyond the ragged bottom, so no sliver is
  // already showing on the first frame.
  float y = vUv.y + (flow - 0.5) * RAGGED;
  float head = mix(1.0 + RAGGED + uSoftness, -RAGGED - uSoftness, uProgress);
  float draw = smoothstep(head - uSoftness, head + uSoftness, y);

  // The paint runs out toward the bottom, so the stroke dissolves into the
  // section below instead of being cut off flat at the hero boundary.
  float fade = smoothstep(-0.02, 0.38, vUv.y);

  gl_FragColor = vec4(vec3(1.0, 0.42, 0.2), stroke * draw * fade);
}


