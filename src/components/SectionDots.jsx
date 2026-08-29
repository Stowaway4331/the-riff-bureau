import { useCallback, useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { scrollToSection } from '../utils/scrollToSection';

/** Wrapper whose direct <section> children become the dots. */
const PAGE_SELECTOR = '.page-sections';

/*
 * A dot's name, in order of preference. Everything after the first branch is
 * a fallback, so a newly added section gets a sensible label - and a dot -
 * without anyone remembering to register it anywhere. `data-nav-label` is
 * only for sections whose own headings read badly as navigation (the hero's
 * <h1> is the site's name, not a destination).
 */
function labelFor(section, index) {
  const explicit = section.dataset.navLabel || section.getAttribute('aria-label');
  if (explicit) return explicit;

  const eyebrow = section.querySelector('[class$="-eyebrow"]');
  if (eyebrow?.textContent.trim()) return eyebrow.textContent.trim();

  const heading = section.querySelector('h1, h2');
  if (heading?.textContent.trim()) return heading.textContent.trim();

  return `Section ${index + 1}`;
}

export function SectionDots({ hidden = false }) {
  const [sections, setSections] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  /*
   * The dots are derived from the DOM rather than from a list kept alongside
   * App.jsx, so adding a <section> to the page is the whole job - the
   * MutationObserver picks it up and a dot appears in the right order. It
   * only fires on real childList changes, so this does not re-render on
   * scroll.
   */
  useEffect(() => {
    const page = document.querySelector(PAGE_SELECTOR);
    if (!page) return;

    const read = () =>
      setSections(
        [...page.querySelectorAll(':scope > section')].map((el, index) => ({
          el,
          label: labelFor(el, index),
        }))
      );

    read();

    const observer = new MutationObserver(read);
    observer.observe(page, { childList: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sections.length) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      // The section covering the middle of the viewport is the one being
      // read, which tracks far better than "topmost visible" when sections
      // differ in height.
      const marker = window.innerHeight / 2;
      let next = 0;
      sections.forEach(({ el }, index) => {
        if (el.getBoundingClientRect().top <= marker) next = index;
      });

      // A final section shorter than half the viewport can never reach the
      // marker, so its dot would never light up. Hitting the bottom of the
      // document always means the last section.
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) next = sections.length - 1;

      setActiveIndex(next);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [sections]);

  const goTo = useCallback(
    (el) => scrollToSection(el, { reducedMotion }),
    [reducedMotion]
  );

  if (!sections.length) return null;

  return (
    <nav
      className={`section-dots${hidden ? ' is-hidden' : ''}`}
      aria-label="Section navigation"
      inert={hidden}
    >
      {sections.map(({ el, label }, index) => (
        <button
          key={label + index}
          type="button"
          className="section-dot"
          onClick={() => goTo(el)}
          aria-current={index === activeIndex ? 'true' : undefined}
        >
          <span className="section-dot-label">{label}</span>
          <span className="section-dot-mark" aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
