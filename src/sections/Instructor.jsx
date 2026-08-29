import { useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useReactivePhoto } from '../hooks/useReactivePhoto';
import { buildBlobPath, BASE_RADII, BLOB_VIEWBOX } from '../utils/blobPath';

// Placeholder copy — Yadhu will supply the real write-up; swap this array
// (and the highlights below) for it directly, the markup does not change.
const bio = [
  'Yadhu VK has seen it all inside Bangalore’s independent music scene - both as a gigging guitarist and as a songwriter whose work has drawn inspiration from the city’s sound and the experiences that come with it.',
  'That’s the instinct he brings to every lesson: not just the mechanics of playing, but the judgment to know when a phrase is actually working. The Riff Bureau grew out of a simple observation - most students don’t stall because they can’t practice. They stall because no one ever taught them how to listen. Yadhu builds that ear alongside the fretwork, one student at a time.',
];

const highlights = [
  '5+ Years On Stage & In The Studio',
  '1:1 Focused Lessons',
  'Based In Bangalore',
];

export function Instructor() {
  const sectionRef = useRef();
  const photoWrapRef = useRef();
  const maskPathRef = useRef();
  const glowPathRef = useRef();
  const glowGradientRef = useRef();

  useScrollReveal(sectionRef, '.instructor-reveal', { y: 26, stagger: 0.16 });
  useReactivePhoto({
    wrapRef: photoWrapRef,
    maskPathRef,
    glowPathRef,
    glowGradientRef,
  });

  return (
    <section className="instructor" ref={sectionRef} data-nav-label="Meet the Instructor">
      <div className="instructor-container">
        <div
          className="instructor-photo-wrap instructor-reveal"
          ref={photoWrapRef}
        >
          {/*
            Mask and glow are the SAME shape, from the SAME `d` string.
            useReactivePhoto builds the path once per frame and writes it to
            both, so editing BASE_RADII (or the blob maths generally) changes
            the photo's silhouette and its halo together - they cannot drift
            apart. The glow is just the blob again, scaled up slightly about
            its centre, blurred, and painted behind the photo, so what shows
            is a halo hugging the silhouette rather than a generic circle.

            The photo is an <image> inside this SVG rather than an HTML <img>
            clipped with CSS `clip-path: url(#id)`. That CSS route stacks
            several fragile interop dependencies - a zero-sized SVG hosting
            the clipPath (a width of 0 disables rendering of that element per
            spec), objectBoundingBox units, and an ancestor that GSAP puts a
            transform on for the scroll reveal - any of which can make the
            clipped content vanish outright. Clipping inside the SVG avoids
            all of them and is still fully animatable.

            The image rect is oversized so the mask always has photo beneath
            it, and offset so the subject - who sits at roughly 38% across the
            source frame, with empty stairwell to the right - lands exactly at
            the mask's centre. 150% is just above the 147.4% floor below which
            a fully-bulged mask would reach past the image edge and expose the
            glow as a hard crescent. That floor is set by the mask's LEFTWARD
            reach, so it moves whenever BASE_RADII[4] or BULGE change -
            re-derive it before adjusting either.
          */}
          <svg
            className="instructor-photo-svg"
            viewBox={`0 0 ${BLOB_VIEWBOX} ${BLOB_VIEWBOX}`}
            role="img"
            aria-label="Yadhu VK performing live with a guitar"
          >
            <defs>
              {/* userSpaceOnUse so cx/cy are plain viewBox units, independent
                  of the blob's bounding box as it deforms. */}
              <radialGradient
                id="instructor-glow-gradient"
                ref={glowGradientRef}
                gradientUnits="userSpaceOnUse"
                cx="50"
                cy="50"
                r="72"
              >
                <stop offset="0%" stopColor="#ff9c69" stopOpacity="0.72" />
                <stop offset="42%" stopColor="#ff6b35" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
              </radialGradient>

              <filter
                id="instructor-glow-blur"
                x="-35%"
                y="-35%"
                width="170%"
                height="170%"
              >
                <feGaussianBlur stdDeviation="5" />
              </filter>

              <clipPath id="instructor-mask">
                <path
                  ref={maskPathRef}
                  d={buildBlobPath(BASE_RADII, BLOB_VIEWBOX)}
                />
              </clipPath>
            </defs>

            <path
              ref={glowPathRef}
              d={buildBlobPath(BASE_RADII, BLOB_VIEWBOX)}
              fill="url(#instructor-glow-gradient)"
              filter="url(#instructor-glow-blur)"
              transform={`translate(${BLOB_VIEWBOX / 2} ${BLOB_VIEWBOX / 2}) scale(1.1) translate(-${BLOB_VIEWBOX / 2} -${BLOB_VIEWBOX / 2})`}
              opacity="0.32"
            />

            <image
              href="/webp-images/instructor.webp"
              x="-7"
              y="-16"
              width="150"
              height="150"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#instructor-mask)"
            />
          </svg>
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
