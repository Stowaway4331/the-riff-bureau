uniform sampler2D uTexture;
uniform sampler2D uNoise;
uniform float uProgress;
uniform float uSoftness;
uniform float uPlaneAspect;
uniform float uImageAspect;

varying vec2 vUv;

/* NOTE: keep this file pure ASCII. See paintDivider.frag.glsl. */

const float NOISE_AMOUNT = 0.35;

// Height of the dissolve at the foot of the image, in plane UV.
const float BOTTOM_FADE = 0.18;

// Scale UVs so the image "covers" the plane without distorting it.
vec2 coverUv(vec2 uv) {
  vec2 s = uPlaneAspect < uImageAspect
    ? vec2(uPlaneAspect / uImageAspect, 1.0)
    : vec2(1.0, uImageAspect / uPlaneAspect);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec4 texColor = texture2D(uTexture, coverUv(vUv));
  float noise = texture2D(uNoise, vUv).r;

  // Horizontal sweep threshold, perturbed by noise for a jagged organic edge.
  float threshold = vUv.x + (noise - 0.5) * NOISE_AMOUNT;

  // Noise pushes thresholds outside [0, 1], so driving the sweep straight from
  // 0 to 1 would leave part of the image already revealed on the first frame
  // and finish before the last pixels are reached, which reads as the wipe
  // being stuck and then jumping. Remapping past both extremes makes the edge
  // travel in from beyond the left of the plane and continue out past the
  // right, so it is in motion for the whole tween.
  float head = mix(
    -0.5 * NOISE_AMOUNT - uSoftness,
    1.0 + 0.5 * NOISE_AMOUNT + uSoftness,
    uProgress
  );

  float alpha = 1.0 - smoothstep(head - uSoftness, head + uSoftness, threshold);

  // Dissolve the foot of the image so the hero blends into the section below
  // rather than ending on a hard horizontal cut. The canvas is transparent and
  // both sections share the same background, so this reads as a clean handoff.
  alpha *= smoothstep(0.0, BOTTOM_FADE, vUv.y);

  // Warm rim glow riding the leading edge, like wet paint.
  float rim = smoothstep(head - 0.10, head, threshold)
            * (1.0 - smoothstep(head, head + 0.06, threshold));

  vec3 color = mix(texColor.rgb, vec3(1.0, 0.42, 0.2), rim * 0.85);

  gl_FragColor = vec4(color, texColor.a * alpha);
}
