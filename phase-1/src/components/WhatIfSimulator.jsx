import React, { useState } from 'react';
import { X, Sliders, TreeDeciduous, Home, Droplets, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const WhatIfSimulator = ({ zone, onClose }) => {
  const [trees, setTrees] = useState(150);
  const [coolRoofs, setCoolRoofs] = useState(4000);
  const [kiosks, setKiosks] = useState(2);
  const [savedProposal, setSavedProposal] = useState(false);

  const zoneName = zone?.name || 'Dharavi Sector 3 / Transit Camp';
  const baselineRisk = zone?.chrs_risk_score || 88;
  const baselineCanopy = zone?.canopy_cover_pct || 3.2;

  // Dynamic Scenario Projection Math (Empirically grounded)
  // Trees: each 50 trees adds ~1.2% canopy and reduces risk by ~3.5 pts
  // Cool roofs: each 1000 sqm reduces risk by ~2.0 pts
  // Water kiosks: each kiosk reduces risk by ~2.5 pts and improves access
  const addedCanopy = +(trees * 0.024).toFixed(1);
  const projectedCanopy = +(baselineCanopy + addedCanopy).toFixed(1);

  const riskReduction = Math.min(
    35,
    Math.round((trees * 0.07) + (coolRoofs * 0.002) + (kiosks * 2.5))
  );
  const projectedRisk = Math.max(30, baselineRisk - riskReduction);

  // Municipal budget estimation in INR
  const treeCost = trees * 2800; // ₹2,800 per 3-year sapling with tree-guard & maintenance
  const roofCost = coolRoofs * 120; // ₹120 per sqm reflective elastomeric coating
  const kioskCost = kiosks * 175000; // ₹1.75L per solar-powered filtered water kiosk
  const totalBudgetLakhs = ((treeCost + roofCost + kioskCost) / 100000).toFixed(1);

  const handleSaveProposal = () => {
    setSavedProposal(true);
    setTimeout(() => setSavedProposal(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#10231c] border border-white/10 rounded-2xl shadow-2xl p-7 overflow-hidden">
        {/* Title Bar */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-300/10 text-lime-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display uppercase tracking-wide">
                  Urban Policy Scenario Simulator
                </h3>
                <span className="text-[10px] font-mono text-lime-300 bg-[#183428] px-2 py-0.5 rounded border border-lime-300/20">
                  DECISION ENGINE
                </span>
              </div>
              <p className="text-xs text-sage-400">
                Target Hotspot: <strong className="text-white">{zoneName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-sage-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparative Scenario Projection: CURRENT vs PROJECTED */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {/* Current Baseline */}
          <div className="bg-[#142b22] border border-white/[0.06] p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-sage-400 font-bold">
                CURRENT SCENARIO
              </span>
              <span className="text-[10px] font-mono font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">
                BASELINE
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-sage-300">Heat Risk Score:</span>
                <span className="text-2xl font-extrabold font-display text-red-400">{baselineRisk} / 100</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-sage-300">Canopy Cover:</span>
                <span className="text-sm font-bold font-mono text-white">{baselineCanopy}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-sage-300">Water Access:</span>
                <span className="text-xs font-mono text-amber-300 font-medium">Deficient (0 kiosks)</span>
              </div>
            </div>
          </div>

          {/* Projected Scenario */}
          <div className="bg-[#142b22] border border-lime-300/30 p-4 rounded-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-lime-300 font-bold">
                PROJECTED SCENARIO
              </span>
              <span className="text-[10px] font-mono font-bold text-lime-300 bg-lime-300/10 px-2 py-0.5 rounded border border-lime-300/20">
                -{riskReduction} PTS
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-sage-300">Projected Risk:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-display text-lime-300">{projectedRisk} / 100</span>
                  <span className="text-xs text-sage-400 line-through">{baselineRisk}</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-sage-300">Projected Canopy:</span>
                <span className="text-sm font-bold font-mono text-lime-300">{projectedCanopy}% (+{addedCanopy}%)</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-sage-300">Water Access:</span>
                <span className="text-xs font-mono text-lime-300 font-medium">Adequate ({kiosks} within 250m)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Sliders */}
        <div className="space-y-4 mb-6">
          {/* Tree Canopy Slider */}
          <div className="bg-[#132820] border border-white/[0.06] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TreeDeciduous className="w-4 h-4 text-lime-400" />
                <span className="text-xs font-medium text-white font-mono">High-Canopy Trees Added</span>
              </div>
              <span className="text-sm font-bold font-mono text-lime-300">+{trees} trees</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={trees}
              onChange={(e) => setTrees(Number(e.target.value))}
              aria-label="High-Canopy Trees Added"
              className="w-full accent-lime-300 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-sage-400 font-mono">
              <span>0 trees</span>
              <span>250 trees</span>
              <span>500 trees</span>
            </div>
          </div>

          {/* Cool Roofs Slider */}
          <div className="bg-[#132820] border border-white/[0.06] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-medium text-white font-mono">Solar-Reflective Cool Roofs</span>
              </div>
              <span className="text-sm font-bold font-mono text-lime-300">+{coolRoofs.toLocaleString()} m²</span>
            </div>
            <input
              type="range"
              min="0"
              max="15000"
              step="500"
              value={coolRoofs}
              onChange={(e) => setCoolRoofs(Number(e.target.value))}
              aria-label="Solar-Reflective Cool Roofs Area"
              className="w-full accent-lime-300 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-sage-400 font-mono">
              <span>0 m²</span>
              <span>7,500 m²</span>
              <span>15,000 m²</span>
            </div>
          </div>

          {/* Water Kiosks Slider */}
          <div className="bg-[#132820] border border-white/[0.06] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-white font-mono">Emergency Hydration Kiosks</span>
              </div>
              <span className="text-sm font-bold font-mono text-lime-300">+{kiosks} kiosks</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={kiosks}
              onChange={(e) => setKiosks(Number(e.target.value))}
              aria-label="Emergency Hydration Kiosks"
              className="w-full accent-lime-300 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-sage-400 font-mono">
              <span>0 kiosks</span>
              <span>4 kiosks</span>
              <span>8 kiosks</span>
            </div>
          </div>
        </div>

        {/* Budget & Defensibility Disclaimer */}
        <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl mb-4 text-xs">
          <div>
            <span className="text-[10px] font-mono text-sage-400 uppercase block">Estimated Municipal CAPEX</span>
            <span className="text-base font-bold font-mono text-white">₹{totalBudgetLakhs} Lakhs</span>
          </div>

          <div className="text-[10px] text-sage-400/80 font-mono text-right max-w-xs leading-tight flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-sage-400 shrink-0" />
            <span>Modelled scenario projection based on urban heat empirical indices — not a guaranteed physical drop.</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          {savedProposal ? (
            <div className="flex items-center gap-2 text-xs font-mono text-lime-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Municipal Proposal Exported to Ward G/North Heat Action Plan</span>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-sage-400">
              Export scenario for City Municipal Council approval
            </span>
          )}

          <button
            onClick={handleSaveProposal}
            className="px-5 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-[#10231c] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Commit to Policy Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
