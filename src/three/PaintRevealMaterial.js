import * as THREE from 'three';
import { getNoiseTexture } from './noiseTexture';
import vertexShader from './shaders/paintReveal.vert.glsl?raw';
import fragmentShader from './shaders/paintReveal.frag.glsl?raw';

export function createPaintRevealMaterial(photoTexture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: photoTexture },
      uNoise: { value: getNoiseTexture() },
      uProgress: { value: 0 },
      uSoftness: { value: 0.12 },
      uPlaneAspect: { value: 1 },
      uImageAspect: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  });
}
