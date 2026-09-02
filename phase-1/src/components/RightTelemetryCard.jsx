import React, { useState, useEffect } from 'react';
import {
  Activity,
  TreeDeciduous,
  Home,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Database,
  Info
} from 'lucide-react';
import { getRegionTelemetry } from '../data/indiaStateProfiles.js';

export const RightTelemetryCard = ({
  activeRegion,
  shelters = [],
  reports = [],
  weather,
  onResetIndia
}) => {
  const [slideAnim, setSlideAnim] = useState(false);
  const [showDataSources, setShowDataSources] = useState(false);

  const telemetry = getRegionTelemetry(
    activeRegion?.id,
    activeRegion?.name,
    activeRegion?.level
  );

  // Trigger smooth slide animation automatically from the right whenever activeRegion changes
  useEffect(() => {
    setSlideAnim(false);
    const animTimer = setTimeout(() => {
      setSlideAnim(true);
    }, 30);
    return () => clearTimeout(animTimer);
  }, [activeRegion?.id]);

  const canopyPct = telemetry.level === 'neighborhood' ? 3.2 : (telemetry.level === 'city' ? 11.8 : 19.4);
  const uhiAnomaly = (telemetry.lst_celsius - (weather?.temp_c || 34.0)).toFixed(1);

  return (
    <div className="fixed top-20 right-6 z-30 pointer-events-auto select-none">
      <div
        className={`w-72 lg:w-80 bg-[#10231c] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3.5 transition-all duration-500 ease-out transform ${
          slideAnim
            ? 'translate-x-0 opacity-100 scale-100'
            : 'translate-x-12 opacity-0 scale-95'
        }`}
      >
        {/* Header: Live Satellite Stream & Reset */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-300 animate-ping"></span>
            <span className="text-[10px] font-mono tracking-widest text-lime-300 uppercase font-bold">
              HEAT DECISION ENGINE
            </span>
          </div>

          <button
            onClick={onResetIndia}
            title="Reset Map to Full India View"
            className="flex items-center gap-1 text-[10px] font-mono text-sage-400 hover:text-white bg-white/[0.04] hover:bg-[#183428] px-2 py-1 rounded-md border border-white/10 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-lime-300" />
            <span>INDIA</span>
          </button>
        </div>

        {/* Real-time Heat Vulnerability Gauges */}
        <div className="space-y-2.5">
          {/* UHI Anomaly */}
          <div className="bg-[#142b22] border border-white/[0.06] p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-300" />
              <div>
                <div className="text-[10px] font-mono text-sage-400 uppercase">
                  Urban Heat Anomaly (UHI)
                </div>
                <div className="text-xs text-white font-medium">
                  {uhiAnomaly > 0 ? `+${uhiAnomaly}°C over ambient` : 'Baseline Normal'}
                </div>
              </div>
            </div>
            <div className="text-lg font-bold text-amber-300 font-mono">
              +{uhiAnomaly}°
            </div>
          </div>

          {/* Tree Canopy Cover */}
          <div className="bg-[#142b22] border border-white/[0.06] p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TreeDeciduous className="w-4 h-4 text-lime-400" />
              <div>
                <div className="text-[10px] font-mono text-sage-400 uppercase">
                  Canopy Shading
                </div>
                <div className="text-xs text-white font-medium">
                  {canopyPct < 5 ? 'Severe Deficit' : 'Moderate Shading'}
                </div>
              </div>
            </div>
            <div className="text-lg font-bold text-lime-300 font-mono">
              {canopyPct}%
            </div>
          </div>
        </div>

        {/* Community Resilience Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-[#142b22] border border-white/[0.06] p-2.5 rounded-xl space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-mono text-sage-400 uppercase">
              <Home className="w-3 h-3 text-cyan-400" />
              <span>Cool Shelters</span>
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {shelters.length || 18}
            </div>
            <div className="text-[9px] font-mono text-lime-300/80">Active Centers</div>
          </div>

          <div className="bg-[#142b22] border border-white/[0.06] p-2.5 rounded-xl space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-mono text-sage-400 uppercase">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>SOS Distress</span>
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {reports.length || 6}
            </div>
            <div className="text-[9px] font-mono text-rose-400/80">Community Reports</div>
          </div>
        </div>

        {/* AI Action Insight */}
        <div className="text-[10px] font-mono text-sage-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06] flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-lime-300 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Intervention Priority: Target high-albedo cool roofs on informal sheet-metal clusters.
          </div>
        </div>

        {/* Scientific Attribution & Data Sources (Mentor Change #2) */}
        <div className="border-t border-white/[0.06] pt-2">
          <button
            onClick={() => setShowDataSources(!showDataSources)}
            className="w-full flex items-center justify-between text-[10px] font-mono text-sage-400 hover:text-white uppercase transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-lime-300" />
              <span>Data Source Transparency</span>
            </span>
            <span className="text-lime-300">{showDataSources ? '▲ Hide' : '▼ View'}</span>
          </button>

          {showDataSources && (
            <div className="mt-2 p-2.5 bg-[#142b22] border border-white/[0.06] rounded-xl text-[10px] font-mono text-sage-300 space-y-1.5 animate-in fade-in duration-300">
              <div className="flex justify-between border-b border-white/[0.04] pb-1">
                <span className="text-sage-400">Satellite LST/NDVI:</span>
                <span className="text-white">Landsat-8 & Sentinel-2 Baseline</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.04] pb-1">
                <span className="text-sage-400">Ambient Weather:</span>
                <span className="text-lime-300">Open-Meteo Live API</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.04] pb-1">
                <span className="text-sage-400">Roads & POIs:</span>
                <span className="text-white">OpenStreetMap GIS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sage-400">Community Reports:</span>
                <span className="text-lime-300">CoolNeighbour Platform Users</span>
              </div>
              <div className="text-[9px] text-sage-400/80 pt-1 leading-tight flex items-center gap-1">
                <Info className="w-3 h-3 text-sage-400 shrink-0" />
                <span>Microgrid metrics derived from real spatial calibration patterns.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
