import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { HeroCanvas } from '../three/HeroCanvas';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const HERO_PHOTO = '/Hendrix - full.png';

export function Hero({ ready, onAssetsReady }) {
  const sectionRef = useRef();
  const textColRef = useRef();
  const progressRef = useRef({ photo: 0, brush: 0 });

  const stacked = useMediaQuery('(max-width: 768px)');
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const items = textColRef.current.querySelectorAll('.hero-text-item');

      if (reducedMotion) {
        gsap.set(items, { opacity: 1, y: 0 });
        progressRef.current.photo = 1;
        progressRef.current.brush = 1;
        return;
      }

      gsap.set(items, { opacity: 0, y: 24 });

      // Hold at the unrevealed state until the texture is decoded, so the
      // arrival beat is never half over by the time the hero is visible.
      if (!ready) return;

      // A plain object drives the uniforms; HeroScene copies it in useFrame.
      // Tweening the material directly would couple GSAP to the render loop.
      const progress = { photo: 0, brush: 0 };
      const sync = () => {
        progressRef.current.photo = progress.photo;
        progressRef.current.brush = progress.brush;
      };

      // 3s total, heavily overlapped: the stroke is still being laid down
      // while the photo is already filling in behind it, and the text starts
      // rising before either has finished.
      gsap
        .timeline({ onUpdate: sync })
        .to(progress, { brush: 1, duration: 2.0, ease: 'power2.out' }, 0)
        .to(progress, { photo: 1, duration: 2.75, ease: 'power1.inOut' }, 0.25)
        .to(
          items,
          { opacity: 1, y: 0, duration: 1.6, stagger: 0.2, ease: 'power2.out' },
          0.8,
        );
    },
    { scope: sectionRef, dependencies: [ready, reducedMotion] },
  );

  return (
    <section className="hero" ref={sectionRef}>
      <div className="hero-canvas-layer">
        <HeroCanvas
          photoSrc={HERO_PHOTO}
          progressRef={progressRef}
          stacked={stacked}
          onReady={onAssetsReady}
        />
      </div>

      <div className="hero-grid">
        <div className="hero-photo-cell" aria-hidden="true" />

        <div className="hero-text-column" ref={textColRef}>
          <div className="hero-text-item">
            <img
              className="hero-logo"
              src="/logo 2 white.png"
              alt="The Riff Bureau"
            />
          </div>

          <div className="hero-text-item">
            <h1 className="hero-title">THE RIFF BUREAU</h1>
            <p className="hero-subtitle">By Yadhu VK</p>
          </div>

          <div className="hero-text-item">
            <blockquote className="hero-quote">
              At The Riff Bureau, we don&rsquo;t just teach guitar. We help you
              build a lifelong connection with music.
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
