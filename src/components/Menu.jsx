import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { scrollToSection } from '../utils/scrollToSection';
import { buildPickPath, PICK_VIEWBOX } from '../utils/pickPath';
import { DownloadIcon, RegisterIcon, ArrowIcon } from './icons/MenuIcons';

/** Rendered size of the pick toggle, in px. Mirrored in menu.css. */
const TOGGLE_SIZE = 52;

/*
 * Hamburger geometry, in the pick's own viewBox units. BAR_MID_Y is the
 * pick's AREA centroid (49.99, 43.93) rather than the middle of the box:
 * the outline tapers to a point at y=96, so its mass sits above y=50 and a
 * box-centred icon reads as hanging low. The x centroid lands on 50 already,
 * so the bars are symmetric about it. BAR_GAP is also the distance each
 * outer bar travels to meet the middle one when it folds into an X.
 *
 * At these values the pick is ~75 units wide across the stack, leaving about
 * 24 units of clear space either side of the bars, and the rotated X arms
 * (reach 9.9 units) stay well inside the outline.
 */
const BAR_X1 = 36;
const BAR_X2 = 64;
const BAR_MID_Y = 44;
const BAR_GAP = 7.5;

/*
 * Copied out of references/ into public/ at build time - Vite only serves
 * and fingerprints what lives under public/, so a link into references/
 * 404s in both dev and the built site.
 */
const BROCHURE_URL = '/the-riff-bureau-brochure.pdf';

/*
 * Controlled by App so the section dots can hide while the panel is open;
 * `open` living in one place is what keeps those two in step.
 */
export function Menu({ open, onOpenChange }) {
  const reducedMotion = usePrefersReducedMotion();

  const rootRef = useRef();
  const panelRef = useRef();
  const overlayRef = useRef();
  const toggleRef = useRef();
  const timelineRef = useRef();

  // Distinguishes the first render (do nothing) from a real user toggle
  // (move focus), so the page does not steal focus on load.
  const hasToggled = useRef(false);

  // A link's destination, held until the panel has closed - see below.
  const [pendingTarget, setPendingTarget] = useState(null);

  useGSAP(
    () => {
      // Reduced motion keeps the same start and end states - only the time
      // between them collapses - so open/close stays a single code path.
      const scale = reducedMotion ? 0 : 1;

      timelineRef.current = gsap
        .timeline({ paused: true })
        .fromTo(
          overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.42 * scale, ease: 'power2.out' },
          0
        )
        /*
         * The reveal itself. `inset()` collapsed to the right edge means the
         * panel is laid out and painted in its final position from the
         * start; only the visible window travels. Nothing moves, so text
         * never sub-pixel-shifts mid-animation the way a transform slide
         * does, and the clipped-away region takes no pointer events either.
         */
        .fromTo(
          panelRef.current,
          { clipPath: 'inset(0 0 0 100%)' },
          {
            clipPath: 'inset(0 0 0 0%)',
            duration: 0.62 * scale,
            ease: 'power3.inOut',
          },
          0
        )
        .fromTo(
          panelRef.current.querySelectorAll('.menu-stagger'),
          { autoAlpha: 0, x: 26 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.5 * scale,
            stagger: 0.07 * scale,
            ease: 'power2.out',
          },
          0.24 * scale
        )
        /*
         * svgOrigin pins each rotation to the bar's own centre in user
         * units, which sidesteps the transform-box / transform-origin
         * inconsistencies that CSS transforms on SVG geometry still have.
         * Rotation resolves first, then the translate carries the bar onto
         * the middle one - so both arms cross exactly at BAR_MID_Y.
         */
        .to(
          '.menu-bar-top',
          {
            rotation: 45,
            y: BAR_GAP,
            svgOrigin: `50 ${BAR_MID_Y - BAR_GAP}`,
            duration: 0.4 * scale,
            ease: 'power2.inOut',
          },
          0.06 * scale
        )
        .to(
          '.menu-bar-bot',
          {
            rotation: -45,
            y: -BAR_GAP,
            svgOrigin: `50 ${BAR_MID_Y + BAR_GAP}`,
            duration: 0.4 * scale,
            ease: 'power2.inOut',
          },
          0.06 * scale
        )
        .to(
          '.menu-bar-mid',
          {
            autoAlpha: 0,
            scaleX: 0.3,
            svgOrigin: `50 ${BAR_MID_Y}`,
            duration: 0.22 * scale,
            ease: 'power2.out',
          },
          0.06 * scale
        );

      return () => timelineRef.current?.kill();
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    if (open) timeline.play();
    else timeline.reverse();

    if (!hasToggled.current) return;

    // Focus follows the panel in and hands itself back on close, so the menu
    // is usable without a pointer and does not drop the user at the top of
    // the document when it shuts.
    if (open) panelRef.current?.querySelector('.menu-link')?.focus();
    else toggleRef.current?.focus();
  }, [open]);

  // Escape closes, matching every other overlay convention.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  /*
   * An in-page link has to close the menu before it can scroll: the panel is
   * open, which means the scroll lock below is holding `overflow: hidden` on
   * the body and the page cannot move at all. Deferring through state rather
   * than a timeout is what makes the ordering guaranteed - React runs every
   * effect CLEANUP for a commit before it runs that commit's effects, so the
   * lock is already released by the time this fires.
   */
  useEffect(() => {
    if (open || !pendingTarget) return;

    setPendingTarget(null);
    scrollToSection(pendingTarget, { reducedMotion });
  }, [open, pendingTarget, reducedMotion]);

  /*
   * Scroll lock. Hiding the body's overflow reclaims the scrollbar's width,
   * which would otherwise let the whole page - including the fixed footer
   * and this toggle - jump sideways behind the blur. Padding the body by the
   * width that disappeared holds the layout still.
   */
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const previous = { overflow: body.style.overflow, padding: body.style.paddingRight };

    body.style.overflow = 'hidden';
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.padding;
    };
  }, [open]);

  const handleToggle = () => {
    hasToggled.current = true;
    onOpenChange(!open);
  };

  const handleJump = (event, target) => {
    event.preventDefault();
    setPendingTarget(target);
    onOpenChange(false);
  };

  return (
    <div className="site-menu-root" ref={rootRef}>
      <div
        className={`menu-overlay${open ? ' is-open' : ''}`}
        ref={overlayRef}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <button
        type="button"
        className={`menu-toggle${open ? ' is-open' : ''}`}
        ref={toggleRef}
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls="site-menu-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
        /*
         * The blurred fill is clipped in the button's own pixel space, so the
         * path has to be emitted at TOGGLE_SIZE rather than in viewBox units
         * - see utils/pickPath.js.
         */
        style={{ '--pick-clip': `path('${buildPickPath(TOGGLE_SIZE)}')` }}
      >
        <span className="menu-toggle-fill" aria-hidden="true" />

        {/*
          Pick and bars share one <svg>, and the stroke is declared once on
          that element in menu.css. Both therefore inherit the identical
          colour and width by construction - there is no second value to keep
          in sync. The fold to an X is driven by the same timeline as the
          panel, so it cannot fall out of step with the menu's actual state.
        */}
        <svg
          className="menu-toggle-icon"
          viewBox={`0 0 ${PICK_VIEWBOX} ${PICK_VIEWBOX}`}
          aria-hidden="true"
        >
          <path d={buildPickPath()} />
          <line
            className="menu-bar-top"
            x1={BAR_X1}
            y1={BAR_MID_Y - BAR_GAP}
            x2={BAR_X2}
            y2={BAR_MID_Y - BAR_GAP}
          />
          <line
            className="menu-bar-mid"
            x1={BAR_X1}
            y1={BAR_MID_Y}
            x2={BAR_X2}
            y2={BAR_MID_Y}
          />
          <line
            className="menu-bar-bot"
            x1={BAR_X1}
            y1={BAR_MID_Y + BAR_GAP}
            x2={BAR_X2}
            y2={BAR_MID_Y + BAR_GAP}
          />
        </svg>

      </button>

      <aside
        className="site-menu"
        id="site-menu-panel"
        ref={panelRef}
        inert={!open}
        aria-label="Site menu"
      >
        <div className="site-menu-inner">
          <div className="menu-head menu-stagger">
            <img src="/logo 2 white.png" alt="The Riff Bureau" />
            <p>Bangalore &middot; 1:1 guitar lessons</p>
          </div>

          <nav className="menu-links">
            <a
              className="menu-link menu-stagger"
              href={BROCHURE_URL}
              download="The Riff Bureau - Brochure.pdf"
            >
              <span className="menu-link-icon">
                <DownloadIcon />
              </span>
              <span className="menu-link-text">
                <strong>Download the brochure</strong>
                <small>The full course breakdown, as a PDF</small>
              </span>
              <span className="menu-link-arrow">
                <ArrowIcon />
              </span>
            </a>

            {/* A real href, so the link still works without JS and can be
                opened in a new tab; the handler only takes over to close the
                panel first and animate the scroll. */}
            <a
              className="menu-link menu-stagger"
              href="#register"
              onClick={(event) => handleJump(event, '#register')}
            >
              <span className="menu-link-icon">
                <RegisterIcon />
              </span>
              <span className="menu-link-text">
                <strong>Register</strong>
                <small>Leave your number for a callback</small>
              </span>
              <span className="menu-link-arrow">
                <ArrowIcon />
              </span>
            </a>
          </nav>

          <p className="menu-foot menu-stagger">
            Prefer to talk first?{' '}
            <a href="tel:+918296054888">+91 8296054888</a>
          </p>
        </div>
      </aside>
    </div>
  );
}
