import { useRef } from 'react';
import { useBackgroundParallax } from '../hooks/useBackgroundParallax';

/**
 * A section's textured backdrop: the photo, plus the tint and edge fades
 * that blend it into the flat --bg of whatever sits above and below.
 *
 * These used to be four stacked `background-image` layers on the section
 * root. They are split into two elements here because the photo now has to
 * move on scroll and the veil must not: transforming a layer is composited,
 * whereas animating `background-position` would repaint the whole section
 * every frame. The split also gives the photo somewhere to travel — as a
 * `cover` background it filled its box exactly, with no slack.
 *
 * `tint` is the opacity of the wash over the photo, per section, since some
 * of the images are far busier than others.
 */
export function SectionBackdrop({ image, tint = 0.97 }) {
  const wrapRef = useRef();
  const imageRef = useRef();

  useBackgroundParallax(imageRef, wrapRef);

  return (
    <div
      className="section-backdrop"
      ref={wrapRef}
      style={{ '--backdrop-tint': tint }}
      aria-hidden="true"
    >
      <div
        className="section-backdrop-image"
        ref={imageRef}
        style={{ backgroundImage: `url("${image}")` }}
      />
      <div className="section-backdrop-veil" />
    </div>
  );
}
