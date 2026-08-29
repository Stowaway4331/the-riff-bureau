import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

/**
 * Scrolls the page to a section, for the dot nav and the menu's links.
 *
 * GSAP rather than scrollIntoView({ behavior: 'smooth' }) or an unprevented
 * anchor jump: the native smooth scroll is the same mechanism as
 * `scroll-behavior: smooth`, which index.css rules out because it animates
 * the scroll position underneath ScrollTrigger while it is trying to read
 * it. A GSAP-driven scroll is one ScrollTrigger stays in step with.
 *
 * @param {Element|string} target element, or a selector to look up.
 */
export function scrollToSection(target, { reducedMotion = false } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  gsap.to(window, {
    scrollTo: { y: el, autoKill: false },
    duration: reducedMotion ? 0 : 0.9,
    ease: 'power2.inOut',
    overwrite: true,
  });
}
