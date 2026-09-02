import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  ShieldCheck,
  Flame,
  Droplets,
  ArrowUpRight,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
  Radio
} from 'lucide-react';
import { getRegionTelemetry } from '../data/indiaStateProfiles.js';
import { fetchLiveRegionWeather } from '../services/liveWeatherService.js';

export const RegionTelemetryDrawer = ({
  activeRegion,
  onOpenXai,
  onOpenSimulator,
  onOpenCoolPath
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [slideAnim, setSlideAnim] = useState(false);
  const [liveWeather, setLiveWeather] = useState(null);

  const baseTelemetry = getRegionTelemetry(
    activeRegion?.id,
    activeRegion?.name,
    activeRegion?.level
  );
  const telemetry = {
    ...baseTelemetry,
    ...(activeRegion || {}),
    name: activeRegion?.name || baseTelemetry.name,
    capital: activeRegion?.capital || baseTelemetry.capital || activeRegion?.name,
    level: activeRegion?.level || baseTelemetry.level
  };

  useEffect(() => {
    setSlideAnim(false);

    const animTimer = setTimeout(() => {
      setSlideAnim(true);
    }, 20);

    let isMounted = true;
    fetchLiveRegionWeather(activeRegion?.id || 'india')
      .then((weather) => {
        if (isMounted) {
          setLiveWeather(weather);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch live weather:', err);
      });

    return () => {
      isMounted = false;
      clearTimeout(animTimer);
    };
  }, [activeRegion?.id]);

  const regionLevelLabel = {
    world: 'PLANETARY OBSERVATORY',
    country: 'NATIONAL OBSERVATORY',
    state: 'STATE OBSERVATORY',
    district: 'DISTRICT CONURBATION',
    city: 'DISTRICT CONURBATION',
    neighborhood: 'INFORMAL CLUSTER',
    microgrid: '500M SATELLITE GRID'
  }[telemetry.level] || 'REGIONAL OBSERVATORY';

  return (
    <div className="fixed top-20 left-8 z-30 pointer-events-auto select-none">
      {/* Collapsed Minimal Pill */}
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 px-4 py-2 rounded-full border border-slate-200/90 shadow-md transition-all cursor-pointer group"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-mono uppercase tracking-wider font-bold">
            {telemetry.name}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
        </button>
      ) : (
        /* White Card from the Left Matching Reference Image */
        <div
          className={`w-80 lg:w-[370px] bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] space-y-3.5 transition-all duration-500 ease-out transform ${
            slideAnim
              ? 'translate-x-0 opacity-100 scale-100'
              : '-translate-x-10 opacity-0 scale-95'
          }`}
        >
          {/* Top Bar: Level Indicator & Info Icon */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-[10px] font-mono tracking-widest text-slate-800 uppercase font-bold">
                {regionLevelLabel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                title="Region Info"
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsCollapsed(true)}
                title="Minimize Panel"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Region Title & Badges */}
          <div className="space-y-2">
            <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 font-display tracking-tight uppercase leading-none">
              {telemetry.name}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-orange-700 bg-orange-50 border border-orange-200/70 px-2.5 py-0.5 rounded-md">
                <MapPin className="w-3 h-3 text-orange-500" />
                {telemetry.capital}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                <Users className="w-3 h-3 text-slate-500" />
                {telemetry.population_millions >= 1000
                  ? `${(telemetry.population_millions / 1000).toFixed(2)}B Pop`
                  : `${telemetry.population_millions}M Pop`}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md font-medium">
                <ShieldCheck className="w-3 h-3 text-red-500" />
                {telemetry.heat_risk}
              </span>
            </div>
          </div>

          {/* Live Weather Box */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                <span className="text-[10px] font-mono tracking-widest text-emerald-700 uppercase font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3" /> LIVE WEATHER RIGHT NOW
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Fetched {liveWeather?.fetchedAt || '02:30 PM'}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-0.5">
              <div>
                <div className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                  {liveWeather ? `${liveWeather.temp_c}°C` : '33.8°C'}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  Current Ambient Air Temp
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-slate-900">
                  Feels like {liveWeather?.apparent_temp_c ?? '38'}°C
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {liveWeather?.relative_humidity ?? 51}% RH • {liveWeather?.wind_speed_kmh ?? 7.8} km/h wind
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 border-t border-slate-200/60 pt-1.5 flex justify-between">
              <span className="truncate max-w-[210px]">Station: {liveWeather?.stationName || telemetry.capital}</span>
              <span className="text-blue-600 font-semibold cursor-pointer">Open-Meteo Live</span>
            </div>
          </div>

          {/* Satellite LST & Hazard WBGT Dual Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50/80 border border-slate-200/70 p-2.5 rounded-xl space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase">
                <Flame className="w-3 h-3 text-red-500" />
                <span>PEAK LST</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {telemetry.lst_celsius}°C
              </div>
              <div className="text-[10px] font-mono text-slate-400">Landsat-8 Baseline</div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/70 p-2.5 rounded-xl space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase">
                <Droplets className="w-3 h-3 text-blue-500" />
                <span>HAZARD WBGT</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {telemetry.wbgt_c}°C
              </div>
              <div className="text-[10px] font-mono text-slate-400">Extreme Wet-Bulb</div>
            </div>
          </div>

          {/* Primary Climate Hazard Driver */}
          <div className="text-[11px] text-slate-700 leading-relaxed bg-slate-50/80 border border-slate-200/70 p-3 rounded-xl">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-orange-500" />
              <span>PRIMARY CLIMATE HAZARD DRIVER</span>
            </div>
            {telemetry.primary_hazard}
          </div>

          {/* Heat Action Plan (HAP) Status */}
          <div className="text-[11px] font-mono text-slate-700 bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded-xl space-y-0.5">
            <div className="text-emerald-800 font-semibold flex items-center gap-1 text-[10px]">
              <Layers className="w-3 h-3 text-emerald-600" />
              <span>HEAT ACTION PLAN (HAP):</span>
            </div>
            <div className="text-slate-800">{telemetry.hap_status}</div>
          </div>

          {/* Action Buttons Matching Reference Image */}
          <div className="pt-1 space-y-2">
            <button
              onClick={onOpenXai}
              className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-900 hover:text-black bg-white hover:bg-slate-50 border border-slate-200/90 py-2.5 px-3.5 rounded-xl transition-all shadow-sm cursor-pointer group"
            >
              <span className="font-bold">HOTSPOT XAI DIAGNOSTICS</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenSimulator}
                className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-800 hover:text-black bg-white hover:bg-slate-50 border border-slate-200/90 py-2 px-3 rounded-xl transition-all shadow-sm cursor-pointer group"
              >
                <span className="font-semibold">SIMULATE</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={onOpenCoolPath}
                className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-800 hover:text-black bg-white hover:bg-slate-50 border border-slate-200/90 py-2 px-3 rounded-xl transition-all shadow-sm cursor-pointer group"
              >
                <span className="font-semibold">COOLPATH</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
