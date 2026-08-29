const STROKE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function AudienceIcon() {
  return (
    <svg {...STROKE}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.3 14.6c2.3.3 4.2 2.3 4.2 5.4" />
    </svg>
  );
}

export function ApproachIcon() {
  return (
    <svg {...STROKE}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <path d="m15.5 8.5-2.3 5.3-5.3 2.3 2.3-5.3Z" />
    </svg>
  );
}

export function ProgrammeIcon() {
  return (
    <svg {...STROKE}>
      <path d="M12 3.5 21 8l-9 4.5L3 8Z" />
      <path d="m3 12 9 4.5 9-4.5" />
      <path d="m3 16 9 4.5 9-4.5" />
    </svg>
  );
}
