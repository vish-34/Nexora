import React from 'react';
import { Droplets, Navigation, MapPin, Clock, Users, ArrowRight, HeartPulse } from 'lucide-react';

export const CitizenMobileView = ({
  shelters,
  onOpenCoolPathModal,
  onOpenReportModal
}) => {
  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in space-y-6">
      {/* Editorial Advisory Banner */}
      <div className="bg-[#18342a]/90 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-lime-300 animate-pulse"></span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-lime-300 font-bold">
            Red Alert &bull; Extreme Heat Hazard
          </span>
        </div>
        <h3 className="text-2xl font-extrabold text-white font-display uppercase tracking-tight mb-2">
          Severe Heat Wave in Effect
        </h3>
        <p className="text-xs text-sage-300 leading-relaxed">
          Ground surface temperatures reach 44°C across informal settlements in Mumbai. Seek air-conditioned shelter during peak sunlight hours (12:00–16:00) and hydrate regularly with electrolyte fluids.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onOpenReportModal}
          className="p-5 rounded-2xl bg-[#18342a] border border-white/[0.08] hover:border-lime-300/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-lime-300/10 text-lime-300">
              <Droplets className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-sage-400 group-hover:text-lime-300 group-hover:translate-x-1 transition-all" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-sage-400 block mb-1">
            Emergency Triage
          </span>
          <strong className="text-base font-bold text-white font-display block">I Need Water / Help</strong>
          <span className="text-xs text-sage-300">Submit geo-tagged report</span>
        </button>

        <button
          onClick={onOpenCoolPathModal}
          className="p-5 rounded-2xl bg-[#18342a] border border-white/[0.08] hover:border-lime-300/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-lime-300/10 text-lime-300">
              <Navigation className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-sage-400 group-hover:text-lime-300 group-hover:translate-x-1 transition-all" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-sage-400 block mb-1">
            Smart Navigation
          </span>
          <strong className="text-base font-bold text-white font-display block">Navigate via CoolPath</strong>
          <span className="text-xs text-sage-300">74% shaded canopy corridors</span>
        </button>
      </div>

      {/* Nearest Verified Cooling Centers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-widest text-sage-300 font-semibold">
            Verified Emergency Cooling Shelters
          </h3>
          <span className="text-[10px] font-mono text-lime-300 bg-lime-300/10 px-2 py-0.5 rounded">
            {shelters?.length || 4} Available
          </span>
        </div>

        {shelters?.map((shelter) => (
          <div
            key={shelter.id}
            className="moss-card p-5 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-lime-300 block mb-0.5">
                  {shelter.category} &bull; {shelter.distance_meters ? `${shelter.distance_meters}m away` : 'Within 500m'}
                </span>
                <h4 className="text-base font-bold text-white font-display">{shelter.name}</h4>
              </div>
              <span className="text-[10px] font-mono text-lime-300 bg-lime-300/10 px-2 py-0.5 rounded border border-lime-300/20 font-semibold">
                {shelter.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-sage-400 mb-3">
              <MapPin className="w-3.5 h-3.5 text-lime-300 shrink-0" />
              <span>{shelter.address}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <span className="text-xs text-sage-400 font-mono">
                {shelter.current_occupancy} / {shelter.capacity} Beds Active
              </span>
              <button
                onClick={onOpenCoolPathModal}
                className="px-3 py-1.5 rounded-lg bg-lime-300 hover:bg-lime-200 text-[#10231c] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1"
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
