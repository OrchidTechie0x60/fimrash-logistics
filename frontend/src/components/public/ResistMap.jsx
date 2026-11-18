import React, { useId, useMemo } from 'react';
import { MAP_NODES } from '../../data/kanoMap';

// Kano's landmarks as tie-resist rings on indigo cloth. The chosen route "dyes in" as an
// undyed running stitch. Pointer-only enhancement: the selects beside it are the accessible control.

const LABEL_LEFT = new Set(['kwari-textiles', 'zoo-road', 'sharada-industrial', 'hotoro-gra', 'janbulo-dorayi', 'nassarawa-gra', 'gyadi-gyadi', 'unguwa-uku']);
// Concentric dye-pit rings behind the city, centred on the old city markets.
const PIT = { x: 330, y: 205, radii: [60, 105, 150, 195, 240, 285] };

function nearestThreads(nodes) {
  const seen = new Set();
  const threads = [];
  nodes.forEach((a) => {
    nodes
      .filter((b) => b.id !== a.id)
      .map((b) => ({ b, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ b }) => {
        const key = [a.id, b.id].sort().join('|');
        if (!seen.has(key)) {
          seen.add(key);
          threads.push([a, b]);
        }
      });
  });
  return threads;
}

export default function ResistMap({ fromId, toId, onPick }) {
  const uid = useId().replace(/:/g, '');
  const threads = useMemo(() => nearestThreads(MAP_NODES), []);
  const from = MAP_NODES.find((n) => n.id === fromId);
  const to = MAP_NODES.find((n) => n.id === toId);

  let routePath = null;
  if (from && to && from.id !== to.id) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const cx = (from.x + to.x) / 2 + dy * 0.22;
    const cy = (from.y + to.y) / 2 - dx * 0.22;
    routePath = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
  }

  return (
    <svg viewBox="22 22 600 378" className="w-full h-auto select-none" aria-hidden="true">
      <defs>
        {/* Dye bleeds along the cotton fibres: a fuzzy, slightly wandering edge. */}
        <filter id={`bleed-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" result="moved" />
          <feGaussianBlur in="moved" stdDeviation="0.45" />
        </filter>
        <filter id={`soak-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <radialGradient id={`pit-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f1eadb" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#f1eadb" stopOpacity="0" />
        </radialGradient>
        <mask id={`reveal-${uid}`}>
          {routePath && (
            <path
              key={`${fromId}-${toId}`}
              d={routePath}
              pathLength="1"
              fill="none"
              stroke="#fff"
              strokeWidth="26"
              strokeLinecap="round"
              strokeDasharray="1"
              className="iw-route-reveal"
            />
          )}
        </mask>
      </defs>

      {/* The pit: faint tie-resist rings radiating from the old city */}
      <g filter={`url(#bleed-${uid})`} fill="none" stroke="#f1eadb">
        {PIT.radii.map((r, i) => (
          <circle key={r} cx={PIT.x} cy={PIT.y} r={r} strokeOpacity={0.085 - i * 0.01} strokeWidth={i % 2 ? 1 : 2.4} strokeDasharray={i % 2 ? '1.5 6' : undefined} />
        ))}
      </g>

      {/* Faint resist threads between neighbouring landmarks */}
      <g filter={`url(#bleed-${uid})`} stroke="#f1eadb" strokeOpacity="0.16" strokeWidth="1.3" strokeDasharray="2 5" fill="none">
        {threads.map(([a, b]) => (
          <line key={`${a.id}-${b.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        ))}
      </g>

      {/* The route, dyed in */}
      {routePath && (
        <g key={`${fromId}-${toId}`} mask={`url(#reveal-${uid})`}>
          <path d={routePath} fill="none" stroke="#f1eadb" strokeOpacity="0.28" strokeWidth="20" strokeLinecap="round" filter={`url(#soak-${uid})`} />
          <path d={routePath} fill="none" stroke="#f1eadb" strokeWidth="4.6" strokeLinecap="round" strokeDasharray="9 7" filter={`url(#bleed-${uid})`} />
        </g>
      )}

      {/* Landmark rings */}
      {MAP_NODES.map((n) => {
        const isFrom = n.id === fromId;
        const isTo = n.id === toId;
        const chosen = isFrom || isTo;
        const left = LABEL_LEFT.has(n.id);
        return (
          <g key={n.id} className="iw-map-node" onClick={() => onPick?.(n.id)}>
            <title>{n.label}</title>
            <circle cx={n.x} cy={n.y} r="24" fill="transparent" />
            {!chosen && <circle cx={n.x} cy={n.y} r="12.5" fill="#14215c" fillOpacity="0.92" />}
            <g filter={`url(#bleed-${uid})`}>
              {chosen && (
                <g key={`${n.id}-${isFrom ? 'a' : 'b'}`} className="iw-bloom">
                  <circle cx={n.x} cy={n.y} r="38" fill={`url(#pit-${uid})`} />
                  <circle cx={n.x} cy={n.y} r="30" fill="none" stroke="#f1eadb" strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="1.5 4" />
                  <circle cx={n.x} cy={n.y} r="21" fill="none" stroke="#f1eadb" strokeOpacity="0.55" strokeWidth="2" />
                </g>
              )}
              <circle className="ring ring-outer" cx={n.x} cy={n.y} r={chosen ? 13 : 10} fill="none" stroke="#f1eadb"
                strokeOpacity={chosen ? 0.9 : 0.4} strokeWidth="1.6" strokeDasharray="1.6 3.2" />
              <circle className="ring ring-core" cx={n.x} cy={n.y} r={chosen ? 8 : 4.5} fill="#f1eadb" fillOpacity={chosen ? 1 : 0.8} />
            </g>
            {chosen && (
              <text x={n.x} y={n.y + 3.6} textAnchor="middle" fontSize="9" fontWeight="800" fill="#0b1240" style={{ fontFamily: 'var(--iw-display)' }}>
                {isFrom ? 'A' : 'B'}
              </text>
            )}
            <text
              x={left ? n.x - 17 : n.x + 17}
              y={n.y + 4}
              textAnchor={left ? 'end' : 'start'}
              fontSize={chosen ? 15 : 12}
              fontWeight={chosen ? 800 : 600}
              fill="#f1eadb"
              fillOpacity={chosen ? 1 : 0.7}
              style={{ fontFamily: chosen ? 'var(--iw-display)' : 'var(--iw-body)', paintOrder: 'stroke' }}
              stroke="#14215c"
              strokeWidth={chosen ? 4 : 3}
              strokeOpacity="0.85"
            >
              {n.name}
            </text>
          </g>
        );
      })}

    </svg>
  );
}
