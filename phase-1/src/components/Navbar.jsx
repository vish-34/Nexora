import React from 'react';
import { Menu, Plus, Navigation, SlidersHorizontal, ChevronDown, Shield } from 'lucide-react';

export const Navbar = ({
  activeWard,
  setActiveWard,
  activePersona,
  setActivePersona,
  weather,
  onOpenReportModal,
  onOpenCoolPathModal,
  onOpenWhatIfModal,
  isVisible = true,
  onMouseEnter,
  onMouseLeave
}) => {
  // Clean Core Hierarchy Navigation
  const coreHierarchy = [
    { id: 'world', label: 'WORLD' },
    { id: 'india', label: 'INDIA' },
    { id: 'maharashtra', label: 'MAHARASHTRA' },
    { id: 'mumbai', label: 'MUMBAI' }
  ];

  // All 36 Indian States & UTs dropdown selector
  const allIndianStates = [
    { id: 'andaman-nicobar', label: 'Andaman & Nicobar' },
    { id: 'andhra-pradesh', label: 'Andhra Pradesh' },
    { id: 'arunachal-pradesh', label: 'Arunachal Pradesh' },
    { id: 'assam', label: 'Assam' },
    { id: 'bihar', label: 'Bihar' },
    { id: 'chandigarh', label: 'Chandigarh' },
    { id: 'chhattisgarh', label: 'Chhattisgarh' },
    { id: 'dadra-and-nagar-haveli-and-daman-and-diu', label: 'Dadra & Nagar Haveli' },
    { id: 'delhi', label: 'Delhi NCR' },
    { id: 'goa', label: 'Goa' },
    { id: 'gujarat', label: 'Gujarat' },
    { id: 'haryana', label: 'Haryana' },
    { id: 'himachal-pradesh', label: 'Himachal Pradesh' },
    { id: 'jammu-kashmir', label: 'Jammu & Kashmir' },
    { id: 'jharkhand', label: 'Jharkhand' },
    { id: 'karnataka', label: 'Karnataka' },
    { id: 'kerala', label: 'Kerala' },
    { id: 'ladakh', label: 'Ladakh' },
    { id: 'lakshadweep', label: 'Lakshadweep' },
    { id: 'madhya-pradesh', label: 'Madhya Pradesh' },
    { id: 'maharashtra', label: 'Maharashtra' },
    { id: 'manipur', label: 'Manipur' },
    { id: 'meghalaya', label: 'Meghalaya' },
    { id: 'mizoram', label: 'Mizoram' },
    { id: 'nagaland', label: 'Nagaland' },
    { id: 'odisha', label: 'Odisha' },
    { id: 'puducherry', label: 'Puducherry' },
    { id: 'punjab', label: 'Punjab' },
    { id: 'rajasthan', label: 'Rajasthan' },
    { id: 'sikkim', label: 'Sikkim' },
    { id: 'tamil-nadu', label: 'Tamil Nadu' },
    { id: 'telangana', label: 'Telangana' },
    { id: 'tripura', label: 'Tripura' },
    { id: 'uttar-pradesh', label: 'Uttar Pradesh' },
    { id: 'uttarakhand', label: 'Uttarakhand' },
    { id: 'west-bengal', label: 'West Bengal' }
  ];

  const isStateSelected = allIndianStates.some(s => s.id === activeWard && s.id !== 'maharashtra');
  const selectedStateName = allIndianStates.find(s => s.id === activeWard)?.label;

  return (
    <header
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-8 py-3.5 shadow-sm transition-all duration-500 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-6">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            aria-label="Menu"
            className="p-1 text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-slate-900 font-display uppercase">
              CoolNeighbour
            </span>
            <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
              AI
            </span>
          </div>
        </div>

        {/* Center: Core Tiers + State Dropdown + Persona Switcher */}
        <nav className="flex items-center gap-7 text-[12px] font-semibold tracking-wider text-slate-500">
          {coreHierarchy.map((region) => {
            const isActive = activeWard === region.id;
            return (
              <button
                key={region.id}
                onClick={() => setActiveWard(region.id)}
                className={`relative py-1 transition-colors uppercase cursor-pointer ${
                  isActive ? 'text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {region.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-950 rounded-full"></span>
                )}
              </button>
            );
          })}

          {/* Clean Dropdown for All 36 States & UTs */}
          <div className="relative inline-flex items-center">
            <select
              value={allIndianStates.some(s => s.id === activeWard) ? activeWard : ''}
              onChange={(e) => {
                if (e.target.value) setActiveWard(e.target.value);
              }}
              aria-label="Select Indian State"
              className={`appearance-none bg-white hover:bg-slate-50 text-[11px] font-semibold uppercase py-1.5 pl-3.5 pr-8 rounded-full border transition-all cursor-pointer shadow-sm focus:outline-none ${
                isStateSelected
                  ? 'text-orange-600 border-orange-300 bg-orange-50/50 font-bold'
                  : 'text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <option value="" disabled className="bg-white text-slate-400">
                {isStateSelected ? `STATE: ${selectedStateName?.toUpperCase()}` : 'SELECT STATE (36 UTs)'}
              </option>
              {allIndianStates.map((st) => (
                <option key={st.id} value={st.id} className="bg-white text-slate-900">
                  {st.label}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 pointer-events-none absolute right-2.5 ${isStateSelected ? 'text-orange-500' : 'text-slate-400'}`} />
          </div>

          {/* Segmented Persona Switcher (Admin HUD | Citizen View) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200/90 shadow-inner">
            <button
              onClick={() => setActivePersona('admin')}
              className={`text-[11px] font-mono px-3.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activePersona === 'admin'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/70'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3 h-3 text-slate-700" />
              <span>ADMIN HUD</span>
            </button>
            <button
              onClick={() => setActivePersona('citizen')}
              className={`text-[11px] font-mono px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                activePersona === 'citizen'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/70'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              CITIZEN
            </button>
          </div>
        </nav>

        {/* Right: Weather Pill + CoolPath + SOS + Sliders */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-slate-700 bg-white border border-slate-200/90 px-3.5 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>{weather?.temp_c ?? 33.8}°C</span>
            <span className="text-slate-300">|</span>
            <span className="text-orange-600 text-[11px] uppercase tracking-wider font-bold">HIGH HEAT</span>
          </div>

          <button
            onClick={onOpenCoolPathModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-slate-600" />
            <span>CoolPath</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-red-500" />
            <span>SOS</span>
          </button>

          <button
            onClick={onOpenWhatIfModal}
            title="What-If Simulation Sandbox"
            className="p-2 text-slate-600 hover:text-slate-950 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200/90 shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
