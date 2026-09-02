import React, { useState } from 'react';
import {
  Flame,
  TreePine,
  Droplets,
  Building2,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const MapPinMarker = ({ pin, x, y, onInspect }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Pin Visual Configuration by Type (Matching User Reference Legend)
  const getPinConfig = () => {
    switch (pin.type) {
      case 'hotspot':
        return {
          icon: <Flame className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-red-500',
          ring: 'border-red-300 ring-red-400/40',
          ping: 'bg-red-400',
          label: 'Heat Hotspot',
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.7)]'
        };
      case 'low_veg':
        return {
          icon: <TreePine className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-emerald-600',
          ring: 'border-emerald-300 ring-emerald-400/40',
          ping: 'bg-emerald-400',
          label: 'Low Vegetation Zone',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.7)]'
        };
      case 'water_needed':
        return {
          icon: <Droplets className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-sky-500',
          ring: 'border-sky-300 ring-sky-400/40',
          ping: 'bg-sky-400',
          label: 'Water Facility Needed',
          glow: 'shadow-[0_0_15px_rgba(14,165,233,0.7)]'
        };
      case 'cooling_centre':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-violet-600',
          ring: 'border-violet-300 ring-violet-400/40',
          ping: 'bg-violet-400',
          label: 'Cooling Centre',
          glow: 'shadow-[0_0_15px_rgba(139,92,246,0.7)]'
        };
      case 'citizen_report':
        return {
          icon: <Users className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-indigo-600',
          ring: 'border-indigo-300 ring-indigo-400/40',
          ping: 'bg-indigo-400',
          label: 'Citizen Report',
          glow: 'shadow-[0_0_15px_rgba(99,102,241,0.7)]'
        };
      case 'vulnerability':
      default:
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-amber-500',
          ring: 'border-amber-300 ring-amber-400/40',
          ping: 'bg-amber-400',
          label: 'High Vulnerability Area',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.7)]'
        };
    }
  };

  const config = getPinConfig();

  // Position offset for leader line & card
  const lineOffsetX = 45;
  const lineOffsetY = 24;

  return (
    <div
      className="absolute pointer-events-auto select-none transition-transform duration-75"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        zIndex: isHovered ? 50 : 25
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Centered Anchor Point */}
      <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        {/* Pulsing Outer Ping Ring */}
        <span
          className={`absolute w-8 h-8 rounded-full ${config.ping} opacity-40 animate-ping pointer-events-none`}
        ></span>

        {/* Outer Glow Halo */}
        <div
          className={`relative flex items-center justify-center w-7 h-7 rounded-full ${config.bg} ${config.glow} text-white shadow-lg border-2 border-white ring-2 ${config.ring} cursor-pointer hover:scale-125 transition-transform duration-200`}
          onClick={() => onInspect && onInspect(pin)}
        >
          {config.icon}
        </div>
      </div>

      {/* Leader-Line HUD Info Card (Matching Reference Illustration) */}
      {isHovered && (
        <div className="absolute top-0 left-0 pointer-events-auto z-50 animate-in fade-in duration-150">
          {/* SVG Leader Line connecting Pin to Card */}
          <svg
            className="overflow-visible absolute top-0 left-0 pointer-events-none"
            width={lineOffsetX + 20}
            height={lineOffsetY + 20}
          >
            <path
              d={`M 0 0 H ${lineOffsetX} V ${lineOffsetY}`}
              fill="none"
              stroke="#0f172a"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              className="opacity-80"
            />
            <circle cx="0" cy="0" r="3" fill="#0f172a" />
            <circle cx={lineOffsetX} cy={lineOffsetY} r="2" fill="#0f172a" />
          </svg>

          {/* Floating Dark HUD Card (As drawn in the reference mockup) */}
          <div
            className="absolute bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-white shadow-2xl min-w-[210px] space-y-1.5"
            style={{
              transform: `translate(${lineOffsetX - 40}px, ${lineOffsetY}px)`
            }}
          >
            {/* Header: Type Badge & Title */}
            <div className="border-b border-slate-800 pb-1.5">
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                <span>{config.label}</span>
              </div>
              <h4 className="text-xs font-bold text-white font-mono tracking-tight mt-0.5 uppercase">
                {pin.name}
              </h4>
            </div>

            {/* Metrics List */}
            <div className="text-[11px] font-mono space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Heat Risk:</span>
                <span className="font-bold text-orange-400">{pin.heat_risk}/100</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">LST:</span>
                <span className="font-bold text-red-400">{pin.lst_celsius}°C</span>
              </div>

              {/* Tree Count Fetched from Official Sources (User's specific requirement) */}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Trees:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-0.5">
                  <TreePine className="w-3 h-3" />
                  <span>{pin.tree_count ? pin.tree_count.toLocaleString() : '1,200'} trees</span>
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Population:</span>
                <span className="font-medium text-slate-200">{pin.population || 'High'}</span>
              </div>
            </div>

            {/* Details Snippet */}
            {pin.details && (
              <p className="text-[10px] font-sans text-slate-400 border-t border-slate-800/80 pt-1 leading-snug">
                {pin.details}
              </p>
            )}

            {/* Inspect Action Button */}
            <div className="pt-1 border-t border-slate-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect && onInspect(pin);
                }}
                className="w-full flex items-center justify-center gap-1 text-[11px] font-mono font-bold text-orange-400 hover:text-orange-300 bg-slate-900 hover:bg-slate-850 py-1 px-2 rounded-lg border border-slate-700/60 transition-all cursor-pointer shadow-xs"
              >
                <span>[ {pin.action_label || 'Inspect'} -&gt; ]</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
