import React from 'react';
import { Droplets, Navigation, MapPin, ArrowRight, AlertTriangle } from 'lucide-react';

export const CitizenMobileView = ({
  shelters,
  reports = [],
  onOpenCoolPathModal,
  onOpenReportModal,
  onOpenDistressFeed
}) => {
  return (
    <div className="max-w-2xl mx-auto py-2 animate-fade-in space-y-6 text-slate-900">
      {/* Advisory Banner */}
      <div className="bg-red-50/80 border border-red-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
          <span className="text-[11px] uppercase font-mono tracking-widest text-red-700 font-bold">
            Red Alert &bull; Extreme Heat Hazard
          </span>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 font-display uppercase tracking-tight mb-2">
          Severe Heat Wave in Effect
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed">
          Ground surface temperatures reach critical levels in unshaded sectors. Seek air-conditioned shelter during peak sunlight hours (12:00–16:00) and hydrate regularly with electrolyte fluids.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onOpenReportModal}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-400 text-left transition-all shadow-sm group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200/60">
              <Droplets className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block mb-0.5">
            Emergency Triage
          </span>
          <strong className="text-sm font-bold text-slate-900 font-display block">Need Water / SOS</strong>
          <span className="text-[11px] text-slate-500">Submit geo-tagged alert</span>
        </button>

        <button
          onClick={onOpenCoolPathModal}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-400 text-left transition-all shadow-sm group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
              <Navigation className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block mb-0.5">
            Smart Navigation
          </span>
          <strong className="text-sm font-bold text-slate-900 font-display block">CoolPath Route</strong>
          <span className="text-[11px] text-slate-500">74% shaded corridors</span>
        </button>

        <button
          onClick={onOpenDistressFeed}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-400 text-left transition-all shadow-sm group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/60">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block mb-0.5">
            Community Alerts
          </span>
          <strong className="text-sm font-bold text-slate-900 font-display block">{reports.length} Live Alerts</strong>
          <span className="text-[11px] text-slate-500">View crowdsourced feed</span>
        </button>
      </div>

      {/* Nearest Verified Cooling Centers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-700 font-bold">
            Verified Emergency Cooling Shelters
          </h3>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
            {shelters?.length || 4} Available
          </span>
        </div>

        {shelters?.map((shelter) => (
          <div
            key={shelter.id}
            className="bg-white p-5 rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 block mb-0.5 font-semibold">
                  {shelter.category} &bull; {shelter.distance_meters ? `${shelter.distance_meters}m away` : 'Within 500m'}
                </span>
                <h4 className="text-base font-bold text-slate-900 font-display">{shelter.name}</h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                {shelter.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{shelter.address}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-mono">
                {shelter.current_occupancy} / {shelter.capacity} Beds Active
              </span>
              <button
                onClick={onOpenCoolPathModal}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Walk via CoolPath</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
