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
  Wind,
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
  const [loadingWeather, setLoadingWeather] = useState(true);

  const telemetry = getRegionTelemetry(
    activeRegion?.id,
    activeRegion?.name,
    activeRegion?.level
  );

  // Trigger smooth slide animation & fetch live weather whenever activeRegion changes
  useEffect(() => {
    setSlideAnim(false);
    setLoadingWeather(true);

    const animTimer = setTimeout(() => {
      setSlideAnim(true);
    }, 20);

    let isMounted = true;
    fetchLiveRegionWeather(activeRegion?.id || 'india')
      .then((weather) => {
        if (isMounted) {
          setLiveWeather(weather);
          setLoadingWeather(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch live weather:', err);
        if (isMounted) setLoadingWeather(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(animTimer);
    };
  }, [activeRegion?.id]);

  const regionLevelLabel = {
    world: 'PLANETARY OBSERVATORY',
    country: 'NATIONAL OBSERVATORY',
    state: 'STATE TELEMETRY',
    district: 'DISTRICT CONURBATION',
    city: 'METROPOLITAN CITY',
    neighborhood: 'INFORMAL CLUSTER',
    microgrid: '500M SATELLITE GRID'
  }[telemetry.level] || 'REGIONAL TELEMETRY';

  return (
    <div className="fixed top-20 left-6 z-30 pointer-events-auto select-none">
      {/* Collapsed Minimal Pill */}
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 bg-[#10231c] hover:bg-[#163024] text-white px-4 py-2 rounded-full border border-white/10 shadow-xl transition-all cursor-pointer group"
        >
          <span className="w-2 h-2 rounded-full bg-lime-300 animate-pulse"></span>
          <span className="text-xs font-mono uppercase tracking-wider font-bold">
            {telemetry.name}
          </span>
          <ChevronRight className="w-4 h-4 text-sage-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      ) : (
        /* Automatic Slide-in Card from the Left */
        <div
          className={`w-80 lg:w-96 bg-[#10231c] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3.5 transition-all duration-500 ease-out transform ${
            slideAnim
              ? 'translate-x-0 opacity-100 scale-100'
              : '-translate-x-12 opacity-0 scale-95'
          }`}
        >
          {/* Top Bar: Level Tag + Minimize Button */}
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-300 animate-pulse"></span>
              <span className="text-[10px] font-mono tracking-widest text-lime-300 uppercase font-bold">
                {regionLevelLabel}
              </span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              title="Minimize Panel"
              className="p-1 text-sage-400 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Region Title & Badges */}
          <div className="space-y-1.5">
            <div className="text-3xl lg:text-4xl font-extrabold text-white font-display tracking-tight uppercase leading-none">
              {telemetry.name}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-lime-300 bg-[#183428] border border-lime-300/20 px-2 py-0.5 rounded">
                <MapPin className="w-3 h-3" />
                {telemetry.capital}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-sage-300 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded">
                <Users className="w-3 h-3" />
                {telemetry.population_millions >= 1000
                  ? `${(telemetry.population_millions / 1000).toFixed(2)}B Pop`
                  : `${telemetry.population_millions}M Pop`}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-[#282516] border border-amber-300/20 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                {telemetry.heat_risk}
              </span>
            </div>
          </div>

          {/* 🟢 LIVE WEATHER RIGHT NOW (Live Open-Meteo Satellite/Weather API) */}
          <div className="bg-[#142b22] border border-lime-300/30 p-3 rounded-xl space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-lime-300 animate-ping"></span>
                <span className="text-[10px] font-mono tracking-widest text-lime-300 uppercase font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3" /> LIVE WEATHER RIGHT NOW
                </span>
              </div>
              <span className="text-[9px] font-mono text-sage-400">
                {liveWeather?.fetchedAt ? `Fetched ${liveWeather.fetchedAt}` : 'Fetching API...'}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-0.5">
              <div>
                <div className="text-3xl font-extrabold font-display text-white tracking-tight">
                  {liveWeather ? `${liveWeather.temp_c}°C` : '--°C'}
                </div>
                <div className="text-[10px] font-mono text-sage-300">
                  Current Ambient Air Temp
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-lime-300">
                  Feels like {liveWeather?.apparent_temp_c ?? '--'}°C
                </div>
                <div className="text-[10px] font-mono text-sage-400 flex items-center justify-end gap-1.5">
                  <span>{liveWeather?.relative_humidity ?? '--'}% RH</span>
                  <span>•</span>
                  <span>{liveWeather?.wind_speed_kmh ?? '--'} km/h wind</span>
                </div>
              </div>
            </div>

            <div className="text-[9px] font-mono text-sage-400 border-t border-white/[0.04] pt-1 flex justify-between">
              <span className="truncate max-w-[190px]">Station: {liveWeather?.stationName || telemetry.capital}</span>
              <span className="text-lime-300/90 shrink-0 font-semibold">Open-Meteo Live</span>
            </div>
          </div>

          {/* 🛰️ SATELLITE BASELINE METRICS (Landsat-8 Thermal Infrared Baseline) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#142b22] border border-white/[0.06] p-2.5 rounded-xl space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-mono text-sage-400 uppercase">
                <Flame className="w-3 h-3 text-red-400" />
                <span>Peak LST</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {telemetry.lst_celsius}°C
              </div>
              <div className="text-[9px] font-mono text-sage-400">Landsat-8 Baseline</div>
            </div>

            <div className="bg-[#142b22] border border-white/[0.06] p-2.5 rounded-xl space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-mono text-sage-400 uppercase">
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>Hazard WBGT</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {telemetry.wbgt_c}°C
              </div>
              <div className="text-[9px] font-mono text-sage-400">Extreme Wet-Bulb</div>
            </div>
          </div>

          {/* Primary Climate Hazard Narrative */}
          <div className="text-[11px] text-sage-300/90 leading-relaxed bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
            <div className="text-[10px] font-mono text-sage-400 uppercase font-semibold mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-300" />
              <span>Primary Climate Hazard Driver</span>
            </div>
            {telemetry.primary_hazard}
          </div>

          {/* Heat Action Plan (HAP) Status */}
          <div className="text-[10px] font-mono text-sage-400 bg-[#163024] p-2.5 rounded-lg border border-white/10 space-y-0.5">
            <div className="text-lime-300 font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>Heat Action Plan (HAP):</span>
            </div>
            <div className="text-white/80">{telemetry.hap_status}</div>
          </div>

          {/* Editorial Quick Actions */}
          <div className="pt-2 border-t border-white/[0.06] space-y-2">
            <button
              onClick={onOpenXai}
              className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-wider text-lime-300 hover:text-white bg-lime-300/[0.08] hover:bg-lime-300/[0.15] border border-lime-300/20 px-3 py-2 rounded-lg transition-colors cursor-pointer group"
            >
              <span>HOTSPOT XAI DIAGNOSTICS</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenSimulator}
                className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-sage-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer group"
              >
                <span>SIMULATE</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={onOpenCoolPath}
                className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-sage-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer group"
              >
                <span>COOLPATH</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
