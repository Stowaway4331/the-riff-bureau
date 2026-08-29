const STROKE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function CheckIcon() {
  return (
    <svg {...STROKE}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function CaretIcon() {
  return (
    <svg {...STROKE}>
      <path d="m7 9.5 5 5 5-5" />
    </svg>
  );
}
