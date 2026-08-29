import { usePointerParallax } from '../hooks/usePointerParallax';
import { useScrollScramble } from '../hooks/useScrollScramble';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

function BeamedNotes() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

function SingleNote() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="7" cy="17" r="3.2" />
      <path d="M10 17V4" />
      <path d="M10 4c3 .4 5.5 2.3 5.5 4.9 0 1.9-1.3 3.4-3.2 4" />
    </svg>
  );
}

function Sharp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 2.5 8 21.5" />
      <path d="M16 2.5 15 21.5" />
      <path d="M3.5 9 20.5 7" />
      <path d="M3.5 17 20.5 15" />
    </svg>
  );
}

function Flat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 2v16.5" />
      <path d="M8 13c4-1.2 8 .3 8 3.3 0 2.7-3 4.2-6 3.4-1.4-.4-2-1.3-2-1.3" />
    </svg>
  );
}

function Natural() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 3v13" />
      <path d="M16 8v13" />
      <path d="M8 8.5 16 7" />
      <path d="M8 16.5 16 15" />
    </svg>
  );
}

/*
 * Positioned near the four corners plus one far-edge midpoint (a rough
 * pentagon around the frame) so all five sit outside the 32-68% / 32-68%
 * box at the centre of the viewport, with irregular offsets rather than a
 * mirrored grid so the scatter reads as chaotic instead of symmetric.
 *
 * `scramble` params drive the scroll-scrub wobble in useScrollScramble:
 * amp is a percent of viewport width/height (kept small — a wobble around
 * the anchor, not a sweep across the screen), freq is how many wobble
 * cycles happen across the whole document scroll, and phase offsets each
 * symbol's cycle so the five never move in sync.
 */
const ACCENTS = [
  {
    id: 'sharp',
    depth: 18,
    size: 24,
    Glyph: Sharp,
    className: 'accent-sharp',
    scramble: { ampX: 5, ampY: 4, freqX: 2.7, freqY: 3.3, phase: 0.4 },
  },
  {
    id: 'flat',
    depth: 11,
    size: 30,
    Glyph: Flat,
    className: 'accent-flat',
    scramble: { ampX: 4.5, ampY: 5.5, freqX: 3.6, freqY: 2.1, phase: 2.1 },
  },
  {
    id: 'natural',
    depth: 20,
    size: 22,
    Glyph: Natural,
    className: 'accent-natural',
    scramble: { ampX: 6, ampY: 3.5, freqX: 2.1, freqY: 4.4, phase: 4.0 },
  },
  {
    id: 'single',
    depth: 15,
    size: 27,
    Glyph: SingleNote,
    className: 'accent-single',
    scramble: { ampX: 3.8, ampY: 5, freqX: 4.2, freqY: 2.6, phase: 1.2 },
  },
  {
    id: 'beamed',
    depth: 9,
    size: 26,
    Glyph: BeamedNotes,
    className: 'accent-beamed',
    scramble: { ampX: 5.2, ampY: 4.2, freqX: 3.0, freqY: 3.9, phase: 3.3 },
  },
];

export function CursorAccents() {
  const reducedMotion = usePrefersReducedMotion();
  const { register: registerPointer } = usePointerParallax();
  const { register: registerScramble } = useScrollScramble();

  if (reducedMotion) return null;

  return (
    <div className="cursor-accents" aria-hidden="true">
      {ACCENTS.map(({ id, depth, size, Glyph, className, scramble }) => (
        <div
          key={id}
          ref={registerPointer}
          className={`cursor-accent ${className}`}
          data-max-offset={depth}
          style={{ width: size, height: size }}
        >
          {/* Three nested layers so pointer parallax, scroll-scrub wobble, and
              the idle float each own their own transform — see the note in
              cursorAccents.css. */}
          <span
            ref={(el) => registerScramble(el, scramble)}
            className="cursor-accent-scroll"
          >
            <span className="cursor-accent-float">
              <Glyph />
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
