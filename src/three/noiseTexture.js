import * as THREE from 'three';
import { createNoise4D } from 'simplex-noise';

let cached = null;

/**
 * Seamlessly tileable, domain-warped fractal noise baked into a DataTexture.
 *
 * Two things matter here:
 *
 * 1. Tileability. The 2D grid is projected onto a 4D torus before sampling,
 *    so a full lap in u or v returns to the same point in noise space. Plain
 *    noise2D(x, y) is not periodic — with RepeatWrapping every tile boundary
 *    becomes a hard seam straight through the stroke.
 *
 * 2. Domain warping. Straight fBm reads as undifferentiated static. Feeding
 *    fBm back in as an offset to its own input coordinates is what produces
 *    the flowing, curling, flame-and-dune structure. The warp offsets are
 *    themselves periodic in theta/phi, so warping preserves the tiling.
 */
export function getNoiseTexture(size = 256) {
  if (cached) return cached;

  const noise4D = createNoise4D();
  const data = new Uint8Array(size * size * 4);
  const TAU = Math.PI * 2;

  // Low base radius keeps features large and flowing rather than granular;
  // a strong warp is what turns those features into big curling forms.
  const BASE_RADIUS = 0.72;
  const WARP_STRENGTH = 2.3;

  // Signed fBm on the torus. `seed` decorrelates the warp fields from the
  // final field without breaking periodicity in theta/phi.
  const fbm = (theta, phi, octaves, seed) => {
    let value = 0;
    let amplitude = 1;
    let maxAmplitude = 0;
    let radius = BASE_RADIUS;

    for (let o = 0; o < octaves; o++) {
      value +=
        noise4D(
          Math.cos(theta) * radius + seed,
          Math.sin(theta) * radius,
          Math.cos(phi) * radius,
          Math.sin(phi) * radius,
        ) * amplitude;
      maxAmplitude += amplitude;
      amplitude *= 0.5;
      radius *= 2;
    }
    return value / maxAmplitude;
  };

  for (let y = 0; y < size; y++) {
    const phi = (y / size) * TAU;

    for (let x = 0; x < size; x++) {
      const theta = (x / size) * TAU;

      // Warp the sample coordinates by the field itself — the flow comes from
      // here, not from the octave stack.
      const warpTheta = fbm(theta, phi, 2, 0);
      const warpPhi = fbm(theta, phi, 2, 37.4);

      let value = fbm(
        theta + warpTheta * WARP_STRENGTH,
        phi + warpPhi * WARP_STRENGTH,
        4,
        71.9,
      );

      // Mild S-curve: deepens the troughs into dark veins and flattens the
      // crests into broad billows, which is what reads as "flame-like".
      value = (value + 1) / 2;
      value = value * value * (3 - 2 * value);

      const v = Math.round(value * 255);
      const i = (y * size + x) * 4;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  texture.needsUpdate = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  cached = texture;
  return cached;
}
