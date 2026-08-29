const STROKE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function AssessmentIcon() {
  return (
    <svg {...STROKE}>
      <rect x="5" y="4" width="14" height="17" rx="2.2" />
      <path d="M9 3.6h6a1 1 0 0 1 1 1V5.6H8V4.6a1 1 0 0 1 1-1Z" />
      <path d="m9 13 2 2 4-4.5" />
    </svg>
  );
}

export function PracticeClockIcon() {
  return (
    <svg {...STROKE}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2" />
      <path d="M9 2h6" />
    </svg>
  );
}
