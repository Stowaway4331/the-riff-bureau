/**
 * Custom line-art icons for the "What You Receive" row, styled after
 * public/icons-with-background.png: rounded corners, a single consistent
 * stroke weight, no fill except small solid accents. Drawn as plain SVG
 * rather than an icon font or emoji, so weight and color always match the
 * rest of the site's hand-drawn icon set.
 */

const STROKE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function CurriculumIcon() {
  return (
    <svg {...STROKE}>
      <rect x="5" y="4" width="14" height="17" rx="2.2" />
      <path d="M9 3.6h6a1 1 0 0 1 1 1V5.6H8V4.6a1 1 0 0 1 1-1Z" />
      <path d="m8.3 10.4 1 1 1.8-2" />
      <path d="M12.6 10.4h4" />
      <path d="m8.3 14.9 1 1 1.8-2" />
      <path d="M12.6 14.9h4" />
    </svg>
  );
}

export function PracticeGuideIcon() {
  return (
    <svg {...STROKE}>
      <path d="M12 6.4c-1.6-1.3-3.6-1.9-6-1.9v13c2.4 0 4.4.6 6 1.9 1.6-1.3 3.6-1.9 6-1.9v-13c-2.4 0-4.4.6-6 1.9Z" />
      <path d="M12 6.4v13" />
    </svg>
  );
}

export function SongResourcesIcon() {
  return (
    <svg {...STROKE}>
      <path d="M9 17.5V6l9-2v11.5" />
      <circle cx="6.5" cy="17.5" r="2.6" />
      <circle cx="15.5" cy="15.5" r="2.6" />
    </svg>
  );
}

export function FeedbackIcon() {
  return (
    <svg {...STROKE}>
      <path d="M4 5.5h16v10H9.5L5 19v-3.5H4Z" />
      <circle cx="9" cy="10.4" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="10.4" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SupportIcon() {
  return (
    <svg {...STROKE}>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M3.5 13.7c1-1.7 2.6-2.8 4.5-3.2M20.5 13.7c-1-1.7-2.6-2.8-4.5-3.2" />
    </svg>
  );
}
