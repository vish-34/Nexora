import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cloud,
  Home,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Database,
  Info,
  ArrowUpRight
} from 'lucide-react';
import { getRegionTelemetry } from '../data/indiaStateProfiles.js';

export const RightTelemetryCard = ({
  activeRegion,
  shelters = [],
  reports = [],
  weather,
  aiStatus,
  onResetIndia,
  onOpenCoolPath,
  onOpenDistressFeed
}) => {
  const [slideAnim, setSlideAnim] = useState(false);
  const [showDataSources, setShowDataSources] = useState(false);

  const telemetry = getRegionTelemetry(
    activeRegion?.id,
    activeRegion?.name,
    activeRegion?.level
  );

  useEffect(() => {
    setSlideAnim(false);
    const animTimer = setTimeout(() => {
      setSlideAnim(true);
    }, 30);
    return () => clearTimeout(animTimer);
  }, [activeRegion?.id]);

  const canopyPct = activeRegion?.canopy_cover_pct !== undefined
    ? activeRegion.canopy_cover_pct
    : (activeRegion?.properties?.canopy_cover_pct !== undefined
        ? activeRegion.properties.canopy_cover_pct
        : (telemetry.level === 'neighborhood' ? 3.2 : (telemetry.level === 'city' ? 11.8 : 16.5)));

  const currentLST = activeRegion?.lst_celsius || activeRegion?.properties?.lst_celsius || telemetry.lst_celsius || 42.0;
  const uhiAnomaly = (currentLST - (weather?.temp_c || 34.0)).toFixed(1);

  const getInterventionPriority = () => {
    const sid = (activeRegion?.id || 'india').toLowerCase();
    if (sid.includes('rajasthan') || sid.includes('jodhpur') || sid.includes('jaisalmer') || sid.includes('bikaner')) {
      return 'Deploy thermal shade canopies & public chilled water misting kiosks against extreme 47°C Loo heatwaves.';
    }
    if (sid.includes('nagpur') || sid.includes('chandrapur') || sid.includes('vidarbha')) {
      return 'Establish mobile cooling tankers and schedule mandatory outdoor labor work stoppages during peak radiation.';
    }
    if (sid.includes('mumbai') || sid.includes('dharavi') || sid.includes('thane')) {
      return 'Target high-albedo reflective cool roofs and mangrove buffer greening on informal sheet-metal clusters.';
    }
    if (sid.includes('delhi') || sid.includes('lucknow') || sid.includes('kanpur') || sid.includes('patna')) {
      return 'Mobilize 24/7 public cooling respite centers and oral rehydration solution distribution across transit terminals.';
    }
    if (canopyPct < 10) {
      return 'Execute urgent street tree greening and broadleaf sapling plantation to mitigate severe urban canopy deficit.';
    }
    return activeRegion?.primary_hazard || telemetry.primary_hazard || 'Target high-albedo cool roofs on informal sheet-metal clusters.';
  };

  return (
    <div className="fixed top-20 right-8 z-30 pointer-events-auto select-none">
      <div
        className={`w-80 lg:w-[350px] bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] space-y-3.5 transition-all duration-500 ease-out transform ${
          slideAnim
            ? 'translate-x-0 opacity-100 scale-100'
            : 'translate-x-10 opacity-0 scale-95'
        }`}
      >
        {/* Header: Title & Reset Button */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-slate-800 uppercase font-extrabold">
              HEAT DECISION ENGINE
            </span>
          </div>

          <button
            onClick={onResetIndia}
            title="Reset Map to Full India View"
            className="flex items-center gap-1 text-[11px] font-mono text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/90 shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-slate-600" />
            <span>INDIA</span>
          </button>
        </div>

        {/* Live Multi-Tier Link Badge */}
        {aiStatus && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[10px] font-mono font-bold text-emerald-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AI Engine (FastAPI :8000)</span>
            </span>
            <span className="text-emerald-700 font-semibold">{aiStatus.latency_ms ? `${aiStatus.latency_ms}ms` : 'Connected'}</span>
          </div>
        )}

        {/* Real-time Heat Vulnerability Gauges */}
        <div className="space-y-2">
          {/* UHI Anomaly */}
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                  URBAN HEAT ANOMALY (UHI)
                </div>
                <div className="text-xs text-slate-800 font-medium">
                  {uhiAnomaly > 0 ? `+${uhiAnomaly}°C over ambient` : 'Baseline Normal'}
                </div>
              </div>
            </div>
            <div className="text-xl font-extrabold text-orange-500 font-mono">
              +{uhiAnomaly}°C
            </div>
          </div>

          {/* Tree Canopy Shading */}
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                  CANOPY SHADING
                </div>
                <div className="text-xs text-slate-800 font-medium">
                  {canopyPct < 5 ? 'Severe Deficit' : 'Moderate Shading'}
                </div>
              </div>
            </div>
            <div className="text-xl font-extrabold text-blue-600 font-mono">
              {canopyPct}%
            </div>
          </div>
        </div>

        {/* Community Distress Alerts Tile */}
        <button
          onClick={onOpenDistressFeed}
          title="Click to view all Community Distress Reports"
          className="w-full bg-slate-50/80 hover:bg-red-50/70 border border-slate-200/80 hover:border-red-200/80 p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-100/70 text-red-600 border border-red-200/60">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1.5">
                <span>SOS DISTRESS</span>
                <span className="text-[9px] text-red-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  VIEW FEED ↗
                </span>
              </div>
              <div className="text-xs text-slate-700 font-medium">
                Active Community Reports
              </div>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-red-700 font-display transition-colors pr-1">
            {reports.length}
          </div>
        </button>

        {/* Intervention Priority Box with Star Icon */}
        <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase font-bold">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>INTERVENTION PRIORITY</span>
          </div>
          <div className="text-xs text-slate-700 leading-relaxed font-sans">
            {getInterventionPriority()}
          </div>
        </div>

        {/* Data Source Transparency Footer */}
        <div className="border-t border-slate-100 pt-2">
          <button
            onClick={() => setShowDataSources(!showDataSources)}
            className="w-full flex items-center justify-between text-[11px] font-mono text-slate-600 hover:text-slate-900 uppercase transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>DATA SOURCE TRANSPARENCY</span>
            </span>
            <span className="text-blue-600 font-bold flex items-center gap-0.5">
              VIEW <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </button>

          {showDataSources && (
            <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-[10px] font-mono text-slate-700 space-y-1.5 animate-in fade-in duration-300">
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Satellite LST/NDVI:</span>
                <span className="text-slate-900 font-medium">Landsat-8 & Sentinel-2 Baseline</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Ambient Weather:</span>
                <span className="text-blue-600 font-semibold">Open-Meteo Live API</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Roads & POIs:</span>
                <span className="text-slate-900 font-medium">OpenStreetMap GIS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Community Reports:</span>
                <span className="text-emerald-700 font-semibold">CoolNeighbour Platform Users</span>
              </div>
              <div className="text-[9px] text-slate-400 pt-1 leading-tight flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Microgrid metrics derived from real spatial calibration patterns.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
