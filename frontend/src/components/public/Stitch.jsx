import React, { useId } from 'react';

// The running stitch that bound the cloth before dyeing: an uneven thread inset from the
// panel edge. Indigo thread on cotton, cotton thread on indigo. Parent must be `relative`.
export default function Stitch({ tone = 'ink', inset = 10, radius = 14 }) {
  const id = useId().replace(/:/g, '');
  const color = tone === 'ink' ? 'rgba(27, 46, 122, 0.55)' : 'rgba(241, 234, 219, 0.6)';
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute overflow-visible"
      style={{ inset: `${inset}px`, width: `calc(100% - ${inset * 2}px)`, height: `calc(100% - ${inset * 2}px)` }}
    >
      <filter id={`thread-${id}`} x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06 0.09" numOctaves="2" seed="11" />
        <feDisplacementMap in="SourceGraphic" scale="3.2" />
      </filter>
      <rect
        width="100%"
        height="100%"
        rx={radius}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="7 4.5 5 6.5 8.5 4 6 5.5 4.5 7"
        filter={`url(#thread-${id})`}
      />
    </svg>
  );
}
