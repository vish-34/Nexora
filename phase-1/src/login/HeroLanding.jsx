import React, { useState } from 'react';
import {
  Sparkles,
  ArrowUpRight,
  Compass,
  Radio,
  FileText,
  ShieldCheck,
  TrendingUp,
  Leaf,
  Building2,
  Users,
  ChevronDown,
  ArrowDown
} from 'lucide-react';
import heroCityImg from '../assets/hero-city.jpg';

export const HeroLanding = ({ onExploreMap, onOpenLogin, onOpenSolutions, currentUser, onLogout }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  return (
    <div className="relative h-screen w-full bg-[#f8fafc] text-slate-900 font-sans selection:bg-slate-200 overflow-hidden flex flex-col justify-between">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-gradient-to-b from-slate-100/80 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[700px] h-[600px] bg-gradient-to-b from-sky-50/50 via-emerald-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar: Minimalist coolneighbor + Login Button */}
      <header className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 pt-5 pb-2 sm:pt-6 sm:pb-3 flex items-center justify-between z-30 shrink-0">
        {/* Brand Mark: coolneighbor */}
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            coolneighbour
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Right Nav Action: Minimalist Login Button or Authenticated Profile */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/90 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-slate-800">{currentUser.name || currentUser.email}</span>
              </div>
              <button
                onClick={onExploreMap}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-full shadow-sm transition-all cursor-pointer"
              >
                Go to Map ↗
              </button>
              <button
                onClick={onLogout}
                className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Hero Body Container */}
      <main className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 py-2 sm:py-4 flex-1 flex flex-col justify-center overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

          {/* Left Hero Column */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start space-y-4 lg:space-y-6 z-10">
            {/* Top Pill: AI-Powered Urban Heat Intelligence */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/70 text-emerald-800 text-xs font-mono tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold">AI-Powered Urban Heat Intelligence</span>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl xl:text-[62px] font-extrabold font-display tracking-tight text-slate-900 leading-[1.08]">
                Cooler cities.
              </h1>
              {/* "Stronger communities." in refined slate-grey accent */}
              <h2 className="text-4xl sm:text-5xl xl:text-[62px] font-extrabold font-display tracking-tight leading-[1.08] bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400 bg-clip-text text-transparent">
                Stronger communities.
              </h2>
            </div>

            {/* Body Copy */}
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl font-normal">
              Cool Neighbourhoods uses satellite data, AI and community insights to find heat-risk zones and recommend nature-based and infrastructure solutions that keep every neighbourhood safe.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={() => {
                  if (currentUser) {
                    onExploreMap();
                  } else {
                    onOpenLogin();
                  }
                }}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm sm:text-base rounded-xl flex items-center gap-2.5 shadow-lg shadow-slate-900/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
              >
                <span>Explore Heat Risk Map</span>
                <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  if (currentUser) {
                    onOpenSolutions ? onOpenSolutions() : onExploreMap();
                  } else {
                    onOpenLogin();
                  }
                }}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-medium text-sm sm:text-base rounded-xl border border-slate-200/90 flex items-center gap-2 shadow-xs hover:shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>View Solutions</span>
              </button>
            </div>

            {/* Bottom Pill Feature Row */}
            <div className="pt-2 sm:pt-4 max-w-full">
              <div className="inline-flex items-center flex-nowrap whitespace-nowrap gap-3 sm:gap-4 lg:gap-5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-xs text-[11px] sm:text-xs font-medium text-slate-600 select-none">
                <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default shrink-0">
                  <Radio className="w-3.5 h-3.5 text-slate-400" />
                  <span>Satellite & LST</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default shrink-0">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Community Reports</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  <span>AI Recommendations</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Actionable Impact</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Column: 3D Isometric City with Floating Glassmorphic Cards */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center select-none">
            <div className="relative w-full max-w-[460px] lg:max-w-[490px] xl:max-w-[530px] aspect-square flex items-center justify-center">

              {/* Isometric 3D Render Platform */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/40 border border-slate-100 bg-white group">
                <img
                  src={heroCityImg}
                  alt="CoolNeighbour Smart City Heat Risk Platform"
                  className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="eager"
                />

                {/* Gentle Ambient Glow Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* CARD 1: Tree Canopy (Top-Left / Center-Left over green canopy zone) */}
              <div
                onMouseEnter={() => setActiveTooltip('tree')}
                onMouseLeave={() => setActiveTooltip(null)}
                className="hero-glass-card animate-float-2 absolute top-[10%] left-[4%] sm:left-[8%] px-3.5 py-2.5 rounded-2xl flex items-center gap-3 cursor-pointer z-20"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-500 leading-none">
                    Tree Canopy
                  </span>
                  <span className="text-xs font-bold text-emerald-600 leading-tight mt-1">
                    Low
                  </span>
                </div>
              </div>

              {/* CARD 2: Heat Risk (Top-Right over coral red hotspot zone) */}
              <div
                onMouseEnter={() => setActiveTooltip('heat')}
                onMouseLeave={() => setActiveTooltip(null)}
                className="hero-glass-card animate-float-1 absolute top-[4%] right-[4%] sm:right-[10%] px-4 py-3 rounded-2xl cursor-pointer z-20"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5 leading-none">
                      <span>↓ Heat Risk</span>
                    </span>
                    <span className="text-lg font-bold text-[#f97316] leading-tight mt-0.5">
                      High
                    </span>
                  </div>
                  {/* Ascending Trend Sparkline Icon */}
                  <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-500 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* CARD 3: Cooling Centre (Bottom-Left along blue cool route) */}
              <div
                onMouseEnter={() => setActiveTooltip('cooling')}
                onMouseLeave={() => setActiveTooltip(null)}
                className="hero-glass-card animate-float-3 absolute bottom-[10%] left-[6%] sm:left-[12%] px-4 py-3 rounded-2xl flex items-center gap-3.5 cursor-pointer z-20"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-500 leading-none">
                    Cooling Centre
                  </span>
                  <span className="text-sm font-bold text-blue-600 leading-tight mt-1">
                    2.4 km
                  </span>
                </div>
              </div>

              {/* CARD 4: Community (Bottom-Right) */}
              <div
                onMouseEnter={() => setActiveTooltip('community')}
                onMouseLeave={() => setActiveTooltip(null)}
                className="hero-glass-card animate-float-4 absolute bottom-[22%] right-[-2%] sm:right-[4%] px-3.5 py-2.5 rounded-2xl flex items-center gap-3 cursor-pointer z-20"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-500 leading-none">
                    Community
                  </span>
                  <span className="text-xs font-bold text-purple-600 leading-tight mt-1">
                    Active
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
