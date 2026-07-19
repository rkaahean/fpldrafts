export default function PitchBackground() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none"
      aria-hidden
    >
      <rect x="0" y="0" width="100" height="100" fill="#2d9153" />
      <g
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.3"
        fill="none"
        vectorEffect="non-scaling-stroke"
      >
        <rect x="2" y="2" width="96" height="96" />
        <line x1="2" y1="98" x2="98" y2="98" />
        <path d="M 41 98 A 9 9 0 0 1 59 98" />

        <rect x="22" y="2" width="56" height="28" />
        <rect x="36" y="2" width="28" height="10" />
        <path d="M 40 30 A 10 10 0 0 0 60 30" />
      </g>
    </svg>
  );
}
