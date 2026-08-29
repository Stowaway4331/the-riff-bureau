import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createPaintRevealMaterial } from './PaintRevealMaterial';
import {
  BRUSH_PLANE_FRAC,
  NOISE_CELL_W,
  NOISE_ROWS,
  STROKE_CENTRE_U,
  createPaintDividerMaterial,
} from './PaintDividerMaterial';

/**
 * Both planes live in a single scene. Uniforms are read from `progressRef`
 * every frame rather than being tweened directly, so GSAP only ever writes
 * to a plain object and never touches the render loop.
 */
function HeroScene({ photoTexture, progressRef, stacked }) {
  const photoRef = useRef();
  const brushRef = useRef();
  const { viewport } = useThree();

  const photoMaterial = useMemo(
    () => createPaintRevealMaterial(photoTexture),
    [photoTexture],
  );
  const brushMaterial = useMemo(() => createPaintDividerMaterial(), []);

  useEffect(() => {
    return () => {
      photoMaterial.dispose();
      brushMaterial.dispose();
    };
  }, [photoMaterial, brushMaterial]);

  // Lay the planes out against the live viewport, and tell the photo shader
  // the aspect ratios it needs to cover-fit the image without stretching.
  useLayoutEffect(() => {
    const { width, height } = viewport;

    // Photo fills its whole column; the brush is layered over it rather than
    // butted against it, so the stroke reads as paint sitting on the image.
    const photoWidth = stacked ? width : width / 2;
    const photoHeight = stacked ? height / 2 : height;
    const photoX = stacked ? 0 : -width / 4;
    const photoY = stacked ? height / 4 : 0;

    photoRef.current.scale.set(photoWidth, photoHeight, 1);
    photoRef.current.position.set(photoX, photoY, 0);

    const image = photoTexture.image;
    photoMaterial.uniforms.uPlaneAspect.value = photoWidth / photoHeight;
    photoMaterial.uniforms.uImageAspect.value = image.width / image.height;

    // The plane is wider than the stroke so the curve can finish uncut, and
    // the stroke does not sit at the plane's centre — offset the plane so the
    // stroke itself lands on the column seam, straddling it so the paint
    // overlaps the right edge of the photo.
    const brushWidth = width * BRUSH_PLANE_FRAC;
    brushRef.current.scale.set(brushWidth, height, 1);
    brushRef.current.position.set(-(STROKE_CENTRE_U - 0.5) * brushWidth, 0, 0.1);
    brushRef.current.visible = !stacked;

    // Hold the grain at a constant physical size as the plane width changes.
    brushMaterial.uniforms.uNoiseScale.value.set(
      BRUSH_PLANE_FRAC / NOISE_CELL_W,
      NOISE_ROWS,
    );

  }, [viewport, photoTexture, photoMaterial, brushMaterial, stacked]);

  useFrame(() => {
    const { photo, brush } = progressRef.current;
    photoMaterial.uniforms.uProgress.value = photo;
    brushMaterial.uniforms.uProgress.value = brush;
  });

  return (
    <>
      <mesh ref={photoRef} material={photoMaterial} renderOrder={0}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh ref={brushRef} material={brushMaterial} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </>
  );
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function HeroCanvas({ photoSrc, progressRef, stacked, onReady }) {
  const [photoTexture, setPhotoTexture] = useState(null);
  const [failed, setFailed] = useState(false);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    if (!hasWebGL()) {
      setFailed(true);
      readyRef.current?.();
      return;
    }

    let disposed = false;
    let loaded = null;

    new THREE.TextureLoader().load(
      photoSrc,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        loaded = texture;
        setPhotoTexture(texture);
        readyRef.current?.();
      },
      undefined,
      () => {
        if (disposed) return;
        setFailed(true);
        readyRef.current?.();
      },
    );

    return () => {
      disposed = true;
      loaded?.dispose();
    };
  }, [photoSrc]);

  // No WebGL, or the texture never arrived — fall back to a plain image.
  if (failed) {
    return <img className="hero-fallback-img" src={photoSrc} alt="" />;
  }

  if (!photoTexture) return null;

  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <HeroScene
        photoTexture={photoTexture}
        progressRef={progressRef}
        stacked={stacked}
      />
    </Canvas>
  );
}
