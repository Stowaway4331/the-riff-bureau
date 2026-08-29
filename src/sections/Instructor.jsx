import { useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useReactivePhoto } from '../hooks/useReactivePhoto';
import { buildBlobPath, BASE_RADII } from '../utils/blobPath';

// Placeholder copy — Yadhu will supply the real write-up; swap this array
// (and the highlights below) for it directly, the markup does not change.
const bio = [
  'Yadhu VK has spent over a decade inside Bangalore’s independent music scene — first as a gigging guitarist, then as a songwriter whose work has helped shape the city’s sound from the inside.',
  'That’s the instinct he brings to every lesson: not just the mechanics of playing, but the judgment to know when a phrase is actually working. The Riff Bureau grew out of a simple observation — most students don’t stall because they can’t practice. They stall because no one ever taught them how to listen. Yadhu builds that ear alongside the fretwork, one student at a time.',
];

const highlights = [
  '10+ Years On Stage & In The Studio',
  '1:1 Focused Lessons',
  'Based In Bangalore',
];

export function Instructor() {
  const sectionRef = useRef();
  const photoWrapRef = useRef();
  const blobPathRef = useRef();
  const glowRef = useRef();

  useScrollReveal(sectionRef, '.instructor-reveal', { y: 26, stagger: 0.16 });
  useReactivePhoto(photoWrapRef, blobPathRef, glowRef);

  return (
    <section className="instructor" ref={sectionRef}>
      <div className="instructor-container">
        <div
          className="instructor-photo-wrap instructor-reveal"
          ref={photoWrapRef}
        >
          <div className="instructor-photo-glow" ref={glowRef} aria-hidden="true" />
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              {/*
                Organic "paint splash" silhouette (8 jittered anchor points
                around a circle, smoothed with a Catmull-Rom-to-Bezier
                conversion — see src/utils/blobPath.js), in normalized
                objectBoundingBox space so it scales with the image
                regardless of the element's rendered size. Deliberately not
                a recognizable object (not a guitar body, not a pick) — it
                echoes the hero's organic brush-stroke reveal rather than
                competing with the guitar-shaped logo mark.

                The starting `d` is the resting shape; useReactivePhoto
                takes over on every frame once the cursor is near, bulging
                anchor points that face it and easing back to this same
                shape when it moves away.
              */}
              <clipPath id="instructor-mask" clipPathUnits="objectBoundingBox">
                <path ref={blobPathRef} d={buildBlobPath(BASE_RADII)} />
              </clipPath>
            </defs>
          </svg>
          <img
            className="instructor-photo"
            src="/instructor.png"
            alt="Yadhu VK performing live with a guitar"
          />
        </div>

        <div className="instructor-text">
          <p className="instructor-eyebrow instructor-reveal">
            Meet Your Instructor
          </p>
          <h2 className="instructor-name instructor-reveal">Yadhu VK</h2>

          <div className="instructor-bio instructor-reveal">
            {bio.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <ul className="instructor-highlights instructor-reveal">
            {highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
