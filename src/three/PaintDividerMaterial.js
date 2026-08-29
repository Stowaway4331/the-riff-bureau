import * as THREE from 'three';
import { getNoiseTexture } from './noiseTexture';
import vertexShader from './shaders/paintDivider.vert.glsl?raw';
import fragmentShader from './shaders/paintDivider.frag.glsl?raw';

/**
 * Brush plane width as a fraction of viewport width. Wider than the visible
 * stroke so the leftward curve has room to finish inside the plane.
 */
export const BRUSH_PLANE_FRAC = 0.3;

/** Where the stroke sits within its plane, used to centre it on the seam. */
export const STROKE_CENTRE_U = 0.561333;

/**
 * Noise cell width as a fraction of viewport width. Larger cells mean fewer
 * repeats across the stroke, which is what makes the curls read as big
 * sweeping forms instead of busy texture.
 */
export const NOISE_CELL_W = 0.15;

/** Vertical repeats of the flow field over the full stroke height. */
export const NOISE_ROWS = 1;

/** Bristle streaks: many cells across the stroke, stretched along its length. */
export const BRISTLE_SCALE = [26, 1.1];

export function createPaintDividerMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uNoise: { value: getNoiseTexture() },
      uProgress: { value: 0 },
      uSoftness: { value: 0.1 },
      uNoiseScale: { value: new THREE.Vector2(1, 1) },
      uBristleScale: { value: new THREE.Vector2(...BRISTLE_SCALE) },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });
}
