import React from 'react';
import { X, Sparkles, ArrowRight, ShieldAlert, CheckCircle2, Droplets, TreeDeciduous, Home, AlertCircle } from 'lucide-react';

export const XaiDrawer = ({ isOpen, selectedZone, onClose, onOpenSimulator }) => {
  if (!isOpen || !selectedZone) return null;

  const score = selectedZone.chrs_risk_score || 88;
  const lst = selectedZone.lst_celsius || 43.8;
  const canopy = selectedZone.canopy_cover_pct || 3.2;

  // Additive Score Decomposition (Explain WHY)
  const scoreBreakdown = [
    {
      factor: 'Land Surface Temp (LST)',
      detail: `${lst}°C satellite thermal anomaly`,
      points: '+32',
      pct: 36,
      icon: '🔥'
    },
    {
      factor: 'High Built-up Density',
      detail: '92% tin & corrugated metal roofing',
      points: '+21',
      pct: 24,
      icon: '🏢'
    },
    {
      factor: 'Low Vegetation Canopy',
      detail: `${canopy}% canopy (severe deficit)`,
      points: '+18',
      pct: 20,
      icon: '🌳'
    },
    {
      factor: 'Socio-Demographic Exposure',
      detail: 'High elderly & outdoor worker density',
      points: '+12',
      pct: 14,
      icon: '👥'
    },
    {
      factor: 'Hydration & Water Deficit',
      detail: 'Zero municipal kiosks within 350m',
      points: '+5',
      pct: 6,
      icon: '💧'
    }
  ];

  // Prioritized Municipal Action Plan
  const actionPlan = [
    {
      priority: 'Priority 1',
      action: 'Install 2 Emergency Drinking Water Kiosks',
      benefit: 'Immediate relief for 1,400 daily pedestrians',
      icon: Droplets,
      color: 'text-cyan-400'
    },
    {
      priority: 'Priority 2',
      action: 'Targeted Tree Canopy Greening (+150 Trees)',
      benefit: 'Neem & Peepal saplings along primary transit alleys',
      icon: TreeDeciduous,
      color: 'text-lime-400'
    },
    {
      priority: 'Priority 3',
      action: 'Designate Municipal Cooling Shelter within 400m',
      benefit: 'Air-conditioned public school or community hall',
      icon: Home,
      color: 'text-amber-300'
    },
    {
      priority: 'Priority 4',
      action: 'Solar-Reflective Cool-Roof Coating (50 Sheds)',
      benefit: 'High-albedo coating reduces indoor heat by up to 4.2°C',
      icon: AlertCircle,
      color: 'text-sage-300'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in select-none">
      {/* Click-outside backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative z-10 w-full max-w-md bg-[#10231c] border-l border-white/10 shadow-2xl p-6 overflow-y-auto h-full flex flex-col justify-between">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-lime-300 bg-[#183428] px-2 py-0.5 rounded border border-lime-300/20">
                  GEOSPATIAL DECISION ENGINE
                </span>
                <span className="text-xs text-sage-400 font-mono">{selectedZone.ward || 'Ward G/North'}</span>
              </div>
              <h3 className="text-2xl font-bold text-white font-display tracking-tight leading-tight">
                {selectedZone.name || 'Dharavi Hotspot Cluster'}
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-sage-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Composite Score Badge */}
          <div className="bg-[#142b22] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-sage-300 uppercase tracking-widest font-mono">
                Composite Heat Risk Score
              </span>
              <span className="text-[10px] font-mono font-bold text-lime-300 bg-lime-300/10 px-2 py-0.5 rounded">
                CHRS 0–100
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold font-display text-white tracking-tight">
                {score}
              </span>
              <span className="text-xs text-red-400 font-mono font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                CRITICAL RISK ZONE
              </span>
            </div>
            <div className="w-full bg-black/40 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500"
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          {/* Section 1: EXPLAIN WHY (Additive Score Decomposition) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-lime-300" />
                WHY IS THIS AREA AT RISK? (Attribution)
              </span>
              <span className="text-[10px] font-mono text-sage-400">Additive Sum: {score}/100</span>
            </div>

            <div className="space-y-1.5">
              {scoreBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#132820] border border-white/[0.06] p-2.5 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <div>
                      <div className="text-xs text-white font-medium">{item.factor}</div>
                      <div className="text-[10px] text-sage-400 font-mono">{item.detail}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-lime-300 bg-lime-300/10 px-2 py-0.5 rounded border border-lime-300/20">
                    {item.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: DECISION ENGINE RECOMMENDATIONS (Prioritized Actions) */}
          <div className="space-y-2 pt-1 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-300" />
                AI RECOMMENDATION: ACTION PLAN
              </span>
              <span className="text-[10px] font-mono text-lime-300">Ranked by ROI</span>
            </div>

            <div className="space-y-1.5">
              {actionPlan.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#132820] border border-white/[0.06] p-2.5 rounded-lg space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-lime-300 flex items-center gap-1">
                        <Icon className={`w-3 h-3 ${act.color}`} />
                        {act.priority}
                      </span>
                    </div>
                    <div className="text-xs text-white font-semibold">{act.action}</div>
                    <div className="text-[10px] text-sage-400 font-mono">{act.benefit}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action CTA */}
        <div className="pt-4 mt-4 border-t border-white/[0.08]">
          <button
            onClick={() => onOpenSimulator(selectedZone)}
            className="w-full py-3 px-4 rounded-xl bg-lime-300 hover:bg-lime-200 text-[#10231c] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <span>Simulate Interventions in What-If Sandbox</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
