import { usePointerParallax } from '../hooks/usePointerParallax';
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
 */
const ACCENTS = [
  { id: 'sharp', depth: 18, size: 24, Glyph: Sharp, className: 'accent-sharp' },
  { id: 'flat', depth: 11, size: 30, Glyph: Flat, className: 'accent-flat' },
  { id: 'natural', depth: 20, size: 22, Glyph: Natural, className: 'accent-natural' },
  { id: 'single', depth: 15, size: 27, Glyph: SingleNote, className: 'accent-single' },
  { id: 'beamed', depth: 9, size: 26, Glyph: BeamedNotes, className: 'accent-beamed' },
];

export function CursorAccents() {
  const reducedMotion = usePrefersReducedMotion();
  const { register } = usePointerParallax();

  if (reducedMotion) return null;

  return (
    <div className="cursor-accents" aria-hidden="true">
      {ACCENTS.map(({ id, depth, size, Glyph, className }) => (
        <div
          key={id}
          ref={register}
          className={`cursor-accent ${className}`}
          data-max-offset={depth}
          style={{ width: size, height: size }}
        >
          {/* The float lives on an inner element so its CSS transform does not
              collide with the pointer transform GSAP writes to the parent. */}
          <span className="cursor-accent-float">
            <Glyph />
          </span>
        </div>
      ))}
    </div>
  );
}
