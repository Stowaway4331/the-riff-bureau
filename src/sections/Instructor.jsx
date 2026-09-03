import { useCallback, useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useReactivePhoto } from '../hooks/useReactivePhoto';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { buildBlobPath, BASE_RADII, BLOB_VIEWBOX } from '../utils/blobPath';

/*
 * Each instructor is one carousel slide. `photo` carries the <image> rect for
 * that source frame: the blob mask is centred on the viewBox, so the rect is
 * oversized and offset to bring the subject to the middle and to keep photo
 * under the mask's leftward reach (see the long note in the markup below).
 *
 * Bios are PLACEHOLDER copy - Yadhu will supply the real write-ups. Swap the
 * `name`/`bio`/`highlights` strings directly; the markup does not change.
 */
const instructors = [
  {
    id: 'yadhu',
    name: 'Yadhu VK',
    photo: {
      href: '/webp-images/instructor.webp',
      alt: 'Yadhu VK performing live with a guitar',
      x: -7,
      y: -16,
      width: 150,
      height: 150,
    },
    bio: [
      'Yadhu VK has seen it all inside Bangalore’s independent music scene - both as a gigging guitarist and as a songwriter whose work has drawn inspiration from the city’s sound and the experiences that come with it.',
      'That’s the instinct he brings to every lesson: not just the mechanics of playing, but the judgment to know when a phrase is actually working. The Riff Bureau grew out of a simple observation - most students don’t stall because they can’t practice. They stall because no one ever taught them how to listen. Yadhu builds that ear alongside the fretwork, one student at a time.',
    ],
    highlights: [
      'Song-Writer & Guitarist',
      '5+ Years On Stage & In The Studio',
      '1:1 Focused Lessons',
      'Based In Bangalore',
    ],
  },
  {
    id: 'guest',
    // PLACEHOLDER name + bio - Yadhu to supply the second instructor's real details.
    name: 'Jeremie Dsouza',
    photo: {
      href: '/webp-images/instructor2.webp',
      alt: 'The Riff Bureau’s second instructor playing electric guitar on stage',
      // instructor2.webp is a tall (3:4) frame with the player at ~38% across
      // and a lot of dark stage above. The rect is scaled well past the
      // viewBox and pushed up and left so the subject lands at the mask
      // centre and the mask's left/upper reach still has photo beneath it.
      x: -7,
      y: -44,
      width: 154,
      height: 205,
    },
    bio: [
      'Jeremie Dsouza spent close to 10 years honing his skills from different sources. His journey began simply reading about music theory in his school days which slowly developed into technical mastery of the instrument.',
      'He teaches the way he learned on the bandstand: rhythm before flash, listening before licks. His lessons lean on ear training and the small technical habits that keep a player improving long after the novelty wears off. The same patient, one-student-at-a-time approach the Riff Bureau was built on.',
    ],
    highlights: [
      'Lead & Rhythm Guitar',
      'Ear Training & Rhythm Focus',
      '1:1 Focused Lessons',
      'Based In Bangalore',
    ],
  },
];

/** Auto-advance interval. Mirrored into the progress bar's animation-duration. */
const AUTOPLAY_MS = 6500;

/*
 * One carousel slide. It owns its own reactive-photo refs and a namespaced
 * set of SVG ids - the mask/gradient/filter ids MUST be unique per slide or
 * the second <image> would reference the first slide's clip path.
 */
function InstructorSlide({ instructor, active }) {
  const photoWrapRef = useRef();
  const maskPathRef = useRef();
  const glowPathRef = useRef();
  const glowGradientRef = useRef();

  useReactivePhoto({
    wrapRef: photoWrapRef,
    maskPathRef,
    glowPathRef,
    glowGradientRef,
  });

  const { photo } = instructor;
  const maskId = `instructor-mask-${instructor.id}`;
  const gradientId = `instructor-glow-gradient-${instructor.id}`;
  const blurId = `instructor-glow-blur-${instructor.id}`;

  return (
    <article
      className="instructor-slide"
      data-active={active ? 'true' : undefined}
      aria-hidden={active ? undefined : 'true'}
      inert={!active}
    >
      <div className="instructor-photo-wrap" ref={photoWrapRef}>
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
          it, and offset so the subject lands at the mask's centre. See each
          instructor's `photo` rect in the data above for the per-frame
          numbers and why they were picked.
        */}
        <svg
          className="instructor-photo-svg"
          viewBox={`0 0 ${BLOB_VIEWBOX} ${BLOB_VIEWBOX}`}
          role="img"
          aria-label={photo.alt}
        >
          <defs>
            {/* userSpaceOnUse so cx/cy are plain viewBox units, independent
                of the blob's bounding box as it deforms. */}
            <radialGradient
              id={gradientId}
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
              id={blurId}
              x="-35%"
              y="-35%"
              width="170%"
              height="170%"
            >
              <feGaussianBlur stdDeviation="5" />
            </filter>

            <clipPath id={maskId}>
              <path
                ref={maskPathRef}
                d={buildBlobPath(BASE_RADII, BLOB_VIEWBOX)}
              />
            </clipPath>
          </defs>

          <path
            ref={glowPathRef}
            d={buildBlobPath(BASE_RADII, BLOB_VIEWBOX)}
            fill={`url(#${gradientId})`}
            filter={`url(#${blurId})`}
            transform={`translate(${BLOB_VIEWBOX / 2} ${BLOB_VIEWBOX / 2}) scale(1.1) translate(-${BLOB_VIEWBOX / 2} -${BLOB_VIEWBOX / 2})`}
            opacity="0.32"
          />

          <image
            href={photo.href}
            x={photo.x}
            y={photo.y}
            width={photo.width}
            height={photo.height}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${maskId})`}
          />
        </svg>
      </div>

      <div className="instructor-text">
        <p className="instructor-eyebrow">Meet Your Instructor</p>
        <h2 className="instructor-name">{instructor.name}</h2>

        <div className="instructor-bio">
          {instructor.bio.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <ul className="instructor-highlights">
          {instructor.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function Instructor() {
  const sectionRef = useRef();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const count = instructors.length;

  useScrollReveal(sectionRef, '.instructor-reveal', { y: 26, stagger: 0.16 });

  const go = useCallback(
    (index) => setActive(((index % count) + count) % count),
    [count],
  );

  /*
   * Auto-advance, paused while the pointer or keyboard focus is inside the
   * carousel and disabled entirely under reduced motion - the same "render
   * the resting state, animate nothing" contract the rest of the site's
   * motion follows. Any manual navigation changes `active`, which tears down
   * and restarts this timer, so the current slide always gets its full dwell.
   */
  useEffect(() => {
    if (reducedMotion || paused || count < 2) return;
    const id = window.setTimeout(
      () => setActive((prev) => (prev + 1) % count),
      AUTOPLAY_MS,
    );
    return () => window.clearTimeout(id);
  }, [active, paused, reducedMotion, count]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(active - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(active + 1);
    }
  };

  const autoplayActive = !reducedMotion && count > 1;

  return (
    <section
      className="instructor"
      ref={sectionRef}
      data-nav-label="Meet the Instructors"
    >
      <div className="instructor-container">
        <div
          className="instructor-carousel instructor-reveal"
          role="group"
          aria-roledescription="carousel"
          aria-label="Instructors"
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setPaused(false);
            }
          }}
        >
          <div className="instructor-viewport">
            <div className="instructor-track" style={{ '--active': active }}>
              {instructors.map((instructor, index) => (
                <InstructorSlide
                  key={instructor.id}
                  instructor={instructor}
                  active={index === active}
                />
              ))}
            </div>
          </div>

          <div className="instructor-controls">
            <button
              type="button"
              className="instructor-nav"
              aria-label="Previous instructor"
              onClick={() => go(active - 1)}
            >
              <Chevron direction="left" />
            </button>

            <div className="instructor-dots">
              {instructors.map((instructor, index) => (
                <button
                  key={instructor.id}
                  type="button"
                  className="instructor-dot"
                  aria-current={index === active ? 'true' : undefined}
                  aria-label={`Show ${instructor.name}`}
                  onClick={() => go(index)}
                >
                  <span className="instructor-dot-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </button>
              ))}

              {/* Keyed by `active` so it remounts and restarts its CSS
                  animation on every slide change; omitted outright when
                  there is no autoplay to visualise. */}
              {autoplayActive && (
                <span
                  key={active}
                  className="instructor-autoplay"
                  style={{
                    animationDuration: `${AUTOPLAY_MS}ms`,
                    animationPlayState: paused ? 'paused' : 'running',
                  }}
                  aria-hidden="true"
                />
              )}
            </div>

            <button
              type="button"
              className="instructor-nav"
              aria-label="Next instructor"
              onClick={() => go(active + 1)}
            >
              <Chevron direction="right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Thin chevron for the prev/next controls, matching the icon set's stroke. */
function Chevron({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      <path d="m10 6.5 5.5 5.5-5.5 5.5" />
    </svg>
  );
}
