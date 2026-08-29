import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { HeroCanvas } from '../three/HeroCanvas';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const HERO_PHOTO = '/webp-images/Hendrix - full.webp';

// Resting opacity of the background guitar flourish. Kept as one constant
// (rather than a value baked into hero.css) since both the CSS starting
// state and the JS reveal target need to agree on it.
const ART_OPACITY = 0.19;

export function Hero({ ready, onAssetsReady }) {
  const sectionRef = useRef();
  const textColRef = useRef();
  const artRef = useRef();
  const progressRef = useRef({ photo: 0, brush: 0 });

  const stacked = useMediaQuery('(max-width: 768px)');
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const items = textColRef.current.querySelectorAll('.hero-text-item');

      if (reducedMotion) {
        gsap.set(items, { opacity: 1, y: 0 });
        gsap.set(artRef.current, { opacity: ART_OPACITY });
        progressRef.current.photo = 1;
        progressRef.current.brush = 1;
        return;
      }

      gsap.set(items, { opacity: 0, y: 24 });
      gsap.set(artRef.current, { opacity: 0 });

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
      // while the photo is already filling in behind it, the background art
      // and text both start rising before either has finished.
      gsap
        .timeline({ onUpdate: sync })
        .to(progress, { brush: 1, duration: 2.0, ease: 'power2.out' }, 0)
        .to(progress, { photo: 1, duration: 2.75, ease: 'power1.inOut' }, 0.25)
        .to(
          artRef.current,
          { opacity: ART_OPACITY, duration: 1.8, ease: 'power2.out' },
          0.6,
        )
        .to(
          items,
          { opacity: 1, y: 0, duration: 1.6, stagger: 0.2, ease: 'power2.out' },
          0.8,
        );
    },
    { scope: sectionRef, dependencies: [ready, reducedMotion] },
  );

  // data-nav-label: the <h1> below is the site's name, which reads badly as
  // a navigation label, so SectionDots is given one explicitly.
  return (
    <section className="hero" ref={sectionRef} data-nav-label="Home">
      <div className="hero-canvas-layer">
        <HeroCanvas
          photoSrc={HERO_PHOTO}
          progressRef={progressRef}
          stacked={stacked}
          onReady={onAssetsReady}
        />
      </div>

      {/* Faint background flourish behind the text, echoing the guitar-shaped
          logo mark at a much larger scale. Purely decorative. */}
      <img
        ref={artRef}
        className="hero-guitar-art"
        src="/Orange Guitar.png"
        alt=""
        aria-hidden="true"
      />

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
