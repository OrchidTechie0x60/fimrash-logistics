import React, { useState } from 'react';
import { Navigation, Bike, Compass, ShieldAlert, Sparkles } from 'lucide-react';

export default function KanoRouteMap({ pickupLandmark, dropoffLandmark, onSelectLandmark, activeRiderName = 'Musa Garba' }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Scaled coordinates representing Kano Metropolitan Layout on a 600x380 SVG grid
  const MAP_NODES = [
    { id: 'dawanau-market', name: 'Dawanau', label: 'Dawanau Grains', x: 120, y: 50, zone: 'Zone 4 Outer' },
    { id: 'buk-new-campus', name: 'BUK New', label: 'BUK New Campus', x: 90, y: 150, zone: 'Zone 3 Inst' },
    { id: 'buk-old-campus', name: 'BUK Old', label: 'BUK Old / Kabuga', x: 180, y: 180, zone: 'Zone 3 Inst' },
    { id: 'singer-market', name: 'Singer', label: 'Singer FMCG Market', x: 310, y: 110, zone: 'Zone 1 Central' },
    { id: 'kwari-textiles', name: 'Kwari', label: 'Kantin Kwari Textiles', x: 330, y: 160, zone: 'Zone 1 Central' },
    { id: 'sabon-gari', name: 'Sabon Gari', label: 'Sabon Gari Market', x: 380, y: 130, zone: 'Zone 1 Central' },
    { id: 'nassarawa-gra', name: 'Nassarawa', label: 'Nassarawa GRA', x: 480, y: 170, zone: 'Zone 3 Prime' },
    { id: 'post-office-murtala', name: 'Murtala Rd', label: 'Murtala Way / Post Office', x: 370, y: 200, zone: 'Zone 2 Corp' },
    { id: 'farm-centre', name: 'Farm Centre', label: 'Farm Centre GSM', x: 430, y: 250, zone: 'Zone 2 Tech' },
    { id: 'zoo-road', name: 'Zoo Road', label: 'Zoo Rd / Sahad Stores', x: 310, y: 270, zone: 'Zone 2 Retail' },
    { id: 'tarauni-gra', name: 'Tarauni', label: 'Tarauni Residential', x: 440, y: 310, zone: 'Zone 3 Res' },
    { id: 'sharada-industrial', name: 'Sharada', label: 'Sharada Industrial', x: 200, y: 290, zone: 'Zone 4 Ind' },
    { id: 'hotoro-gra', name: 'Hotoro', label: 'Hotoro GRA / NNPC', x: 530, y: 270, zone: 'Zone 3 Res' }
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
  const midX = (pNode.x + dNode.x) / 2 + (dy * 0.18);
  const midY = (pNode.y + dNode.y) / 2 - (dx * 0.18);
  const pathD = `M ${pNode.x} ${pNode.y} Q ${midX} ${midY} ${dNode.x} ${dNode.y}`;

  return (
    <div className="glass-card rounded-3xl p-5 border border-white/10 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-white/10 gap-2 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Kano Metropolis Corridor Radar</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                Live Spatial Mesh
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Interactive intra-city landmark routing & terrain topology</p>
          </div>
        </div>

        {/* Telemetry Pills */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/10 flex items-center space-x-1.5">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Route Length:</span>
            <span className="text-emerald-400 font-mono font-black">{estKm} km</span>
          </div>
          <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/10 flex items-center space-x-1.5">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Courier ETA:</span>
            <span className="text-cyan-400 font-mono font-black">~{estMins} mins</span>
          </div>
        </div>
      </div>

      {/* Vector Canvas Container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-slate-950/90 rounded-2xl border border-white/5 overflow-hidden shadow-inner">
        {/* Subtle grid pattern inside map */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

        <svg viewBox="0 0 600 380" className="w-full h-full">
          <defs>
            {/* Route Gradient */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Major Kano Arterial Road Grid (Faint Lines) */}
          <g stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="4 4" fill="none">
            {/* Zaria Road axis */}
            <line x1="330" y1="160" x2="440" y2="310" />
            {/* Maiduguri Road axis */}
            <line x1="330" y1="160" x2="530" y2="270" />
            {/* Gwarzo Road axis */}
            <line x1="330" y1="160" x2="90" y2="150" />
            {/* Zoo Road axis */}
            <line x1="330" y1="160" x2="310" y2="270" />
            {/* Bompai / Nassarawa link */}
            <line x1="380" y1="130" x2="480" y2="170" />
            {/* Katsina Road / Dawanau axis */}
            <line x1="310" y1="110" x2="120" y2="50" />
          </g>

          {/* Active Navigation Route Line (Glowing curve) */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#neonGlow)"
          />
          {/* Animated dashes travelling along the route */}
          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            strokeLinecap="round"
            className="animate-pulse"
          />

          {/* Animated Courier Motorcycle Pin on the Path */}
          <g transform={`translate(${midX}, ${midY})`}>
            <circle r="14" fill="#06b6d4" fillOpacity="0.2" className="radar-live" />
            <circle r="7" fill="#06b6d4" />
            <circle r="3" fill="#ffffff" />
          </g>

          {/* All Landmark Nodes */}
          {MAP_NODES.map((node) => {
            const isPickup = node.id === pNode.id;
            const isDropoff = node.id === dNode.id;
            const isHovered = hoveredNode?.id === node.id;

            let fillColor = '#1e293b';
            let strokeColor = '#334155';
            let radius = 5;

            if (isPickup) {
              fillColor = '#10b981';
              strokeColor = '#34d399';
              radius = 8;
            } else if (isDropoff) {
              fillColor = '#06b6d4';
              strokeColor = '#38bdf8';
              radius = 8;
            } else if (isHovered) {
              fillColor = '#f59e0b';
              strokeColor = '#fbbf24';
              radius = 7;
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onSelectLandmark && onSelectLandmark(node.id)}
              >
                {/* Radar pulse for active endpoints */}
                {(isPickup || isDropoff) && (
                  <circle
                    r={radius + 8}
                    fill={isPickup ? '#10b981' : '#06b6d4'}
                    fillOpacity="0.25"
                    className="radar-live"
                  />
                )}

                <circle
                  r={radius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                  filter="url(#neonGlow)"
                />

                {/* Node Label Pill */}
                <g transform="translate(0, -12)">
                  <rect
                    x={-(node.name.length * 3.4) - 6}
                    y="-12"
                    width={node.name.length * 6.8 + 12}
                    height="16"
                    rx="8"
                    fill={isPickup ? '#064e3b' : isDropoff ? '#083344' : '#090d16'}
                    stroke={isPickup ? '#10b981' : isDropoff ? '#06b6d4' : '#1e293b'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-1"
                    textAnchor="middle"
                    fill={isPickup ? '#34d399' : isDropoff ? '#38bdf8' : '#94a3b8'}
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="sans-serif"
                  >
                    {node.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Courier Dispatch Capsule */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex items-center space-x-2.5 text-xs shadow-xl">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            🏍️
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white text-[11px]">{activeRiderName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] text-slate-400">En route via State Rd Corridor</span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 flex items-center space-x-3 text-[10px] text-slate-400">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-emerald-300 font-semibold">Pickup</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span className="text-cyan-300 font-semibold">Dropoff</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />
            <span>Node</span>
          </div>
        </div>
      </div>
    </div>
  );
}
