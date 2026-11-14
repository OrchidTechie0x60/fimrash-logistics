import React, { useState } from 'react';
import { Navigation, Compass, ShieldAlert, Sparkles } from 'lucide-react';

export default function KanoRouteMap({ pickupLandmark, dropoffLandmark, onSelectLandmark, activeRiderName = 'Musa Garba' }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Scaled coordinates representing Kano Metropolitan Layout on a 600x380 SVG grid
  const MAP_NODES = [
    { id: 'dawanau-market', name: 'Dawanau', label: 'Dawanau Grains', x: 120, y: 50, zone: 'Zone 4' },
    { id: 'buk-new-campus', name: 'BUK New', label: 'BUK New Campus', x: 90, y: 150, zone: 'Zone 3' },
    { id: 'buk-old-campus', name: 'BUK Old', label: 'BUK Old / Kabuga', x: 180, y: 180, zone: 'Zone 3' },
    { id: 'singer-market', name: 'Singer', label: 'Singer FMCG Market', x: 310, y: 110, zone: 'Zone 1' },
    { id: 'kwari-textiles', name: 'Kwari', label: 'Kantin Kwari Textiles', x: 330, y: 160, zone: 'Zone 1' },
    { id: 'sabon-gari', name: 'Sabon Gari', label: 'Sabon Gari Market', x: 380, y: 130, zone: 'Zone 1' },
    { id: 'nassarawa-gra', name: 'Nassarawa', label: 'Nassarawa GRA', x: 480, y: 170, zone: 'Zone 3' },
    { id: 'post-office-murtala', name: 'Murtala Rd', label: 'Murtala Way / Post Office', x: 370, y: 200, zone: 'Zone 2' },
    { id: 'farm-centre', name: 'Farm Centre', label: 'Farm Centre GSM', x: 430, y: 250, zone: 'Zone 2' },
    { id: 'zoo-road', name: 'Zoo Road', label: 'Zoo Rd / Sahad Stores', x: 310, y: 270, zone: 'Zone 2' },
    { id: 'tarauni-gra', name: 'Tarauni', label: 'Tarauni Residential', x: 440, y: 310, zone: 'Zone 3' },
    { id: 'sharada-industrial', name: 'Sharada', label: 'Sharada Industrial', x: 200, y: 290, zone: 'Zone 4' },
    { id: 'hotoro-gra', name: 'Hotoro', label: 'Hotoro GRA / NNPC', x: 530, y: 270, zone: 'Zone 3' }
  ];

  const pNode = MAP_NODES.find(n => n.id === pickupLandmark?.id) || MAP_NODES[4]; // Default Kwari
  const dNode = MAP_NODES.find(n => n.id === dropoffLandmark?.id) || MAP_NODES[6]; // Default Nassarawa

  // Calculate approximate distance
  const dx = dNode.x - pNode.x;
  const dy = dNode.y - pNode.y;
  const pixelDist = Math.sqrt(dx * dx + dy * dy);
  const estKm = Math.max(2.4, (pixelDist / 38).toFixed(1));
  const estMins = Math.round(estKm * 3.2 + 6);

  // Midpoint for curve control
  const midX = (pNode.x + dNode.x) / 2 + (dy * 0.16);
  const midY = (pNode.y + dNode.y) / 2 - (dx * 0.16);
  const pathD = `M ${pNode.x} ${pNode.y} Q ${midX} ${midY} ${dNode.x} ${dNode.y}`;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-1.5">
              <span>Kano Metropolis Corridor Radar</span>
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                Live Mesh
              </span>
            </h3>
            <p className="text-[10px] text-slate-500">Interactive intra-city landmark routing</p>
          </div>
        </div>

        {/* Telemetry Pills (Calm, muted) */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-slate-50 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-1">
            <span className="text-slate-400 text-[10px] font-semibold">Route:</span>
            <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">{estKm} km</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-1">
            <span className="text-slate-400 text-[10px] font-semibold">ETA:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">~{estMins} mins</span>
          </div>
        </div>
      </div>

      {/* Vector Canvas Container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
        {/* Subtle coordinate grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]" />

        <svg viewBox="0 0 600 380" className="w-full h-full">
          {/* Arterial Road Grid */}
          <g stroke="#1e293b" strokeWidth="1.2" strokeDasharray="3 3" fill="none">
            <line x1="330" y1="160" x2="440" y2="310" />
            <line x1="330" y1="160" x2="530" y2="270" />
            <line x1="330" y1="160" x2="90" y2="150" />
            <line x1="330" y1="160" x2="310" y2="270" />
            <line x1="380" y1="130" x2="480" y2="170" />
            <line x1="310" y1="110" x2="120" y2="50" />
          </g>

          {/* Calm, Solid Emerald Route Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Subtle moving dash */}
          <path
            d={pathD}
            fill="none"
            stroke="#a7f3d0"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            strokeLinecap="round"
          />

          {/* Subtle Courier Pin */}
          <g transform={`translate(${midX}, ${midY})`}>
            <circle r="10" fill="#059669" fillOpacity="0.25" className="radar-live" />
            <circle r="5" fill="#059669" />
            <circle r="2" fill="#ffffff" />
          </g>

          {/* All Landmark Nodes */}
          {MAP_NODES.map((node) => {
            const isPickup = node.id === pNode.id;
            const isDropoff = node.id === dNode.id;
            const isHovered = hoveredNode?.id === node.id;

            let fillColor = '#1e293b';
            let strokeColor = '#334155';
            let radius = 4.5;

            if (isPickup) {
              fillColor = '#059669';
              strokeColor = '#34d399';
              radius = 7;
            } else if (isDropoff) {
              fillColor = '#0284c7';
              strokeColor = '#38bdf8';
              radius = 7;
            } else if (isHovered) {
              fillColor = '#d97706';
              strokeColor = '#f59e0b';
              radius = 6;
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onSelectLandmark && onSelectLandmark(node.id)}
              >
                <circle
                  r={radius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />

                {/* Node Label Pill */}
                <g transform="translate(0, -11)">
                  <rect
                    x={-(node.name.length * 3.2) - 5}
                    y="-11"
                    width={node.name.length * 6.4 + 10}
                    height="15"
                    rx="4"
                    fill={isPickup ? '#064e3b' : isDropoff ? '#0c4a6e' : '#0f172a'}
                    stroke={isPickup ? '#059669' : isDropoff ? '#0284c7' : '#1e293b'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-1"
                    textAnchor="middle"
                    fill={isPickup ? '#a7f3d0' : isDropoff ? '#bae6fd' : '#94a3b8'}
                    fontSize="8.5"
                    fontWeight="600"
                    fontFamily="sans-serif"
                  >
                    {node.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Courier Dispatch Capsule */}
        <div className="absolute bottom-2.5 left-2.5 bg-slate-900/95 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-2 text-xs shadow-md">
          <div className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 flex items-center justify-center text-[10px]">
            🏍️
          </div>
          <div>
            <span className="font-bold text-white text-[10px] block leading-tight">{activeRiderName}</span>
            <span className="text-[9px] text-slate-400">En route via State Rd Corridor</span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-2.5 right-2.5 bg-slate-900/95 px-2 py-1 rounded-lg border border-slate-800 flex items-center space-x-2 text-[9px] text-slate-400">
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-emerald-300">Pickup</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
            <span className="text-sky-300">Dropoff</span>
          </div>
        </div>
      </div>
    </div>
  );
}
