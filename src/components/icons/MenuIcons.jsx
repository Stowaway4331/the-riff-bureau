const STROKE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function DownloadIcon() {
  return (
    <svg {...STROKE}>
      <path d="M12 3.5v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4 17.5v1.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
    </svg>
  );
}

export function RegisterIcon() {
  return (
    <svg {...STROKE}>
      <path d="M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 18 19H6a1.5 1.5 0 0 1-1.5-1.5Z" />
      <path d="M4.5 9.5h15" />
      <path d="M8.5 5V3.2M15.5 5V3.2" />
      <path d="m9.5 14 1.8 1.8 3.4-3.6" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg {...STROKE}>
      <path d="M5 12h13" />
      <path d="m12.5 6.5 5.5 5.5-5.5 5.5" />
    </svg>
  );
}
