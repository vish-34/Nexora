import React from 'react';
import { Menu, Plus, Navigation, SlidersHorizontal, ChevronDown } from 'lucide-react';

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
      className={`fixed top-0 left-0 right-0 z-50 w-full bg-transparent px-8 py-4 transition-all duration-500 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
        {/* Left: Minimal Brand Mark (Clean Flat) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            aria-label="Menu"
            className="p-1 text-sage-300 hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wider text-white font-display uppercase drop-shadow-sm">
              CoolNeighbour
            </span>
            <span className="text-[10px] font-mono uppercase bg-[#183428] text-lime-300 px-1.5 py-0.5 rounded border border-white/10">
              AI
            </span>
          </div>
        </div>

        {/* Center: Clean Flat Navigation (Core Tiers + State Dropdown) */}
        <nav className="flex items-center gap-8 text-[12px] font-medium tracking-widest text-sage-300">
          {coreHierarchy.map((region) => {
            const isActive = activeWard === region.id;
            return (
              <button
                key={region.id}
                onClick={() => setActiveWard(region.id)}
                className={`relative py-1 transition-colors hover:text-white uppercase cursor-pointer drop-shadow-sm ${
                  isActive ? 'text-white font-bold' : 'text-sage-400 hover:text-sage-200'
                }`}
              >
                {region.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-lime-300 rounded-full"></span>
                )}
              </button>
            );
          })}

          {/* Clean Flat Dropdown for All 36 States & UTs */}
          <div className="relative inline-flex items-center">
            <select
              value={allIndianStates.some(s => s.id === activeWard) ? activeWard : ''}
              onChange={(e) => {
                if (e.target.value) setActiveWard(e.target.value);
              }}
              aria-label="Select Indian State"
              className={`appearance-none bg-[#132820] hover:bg-[#183328] text-[11px] font-mono uppercase py-1.5 pl-3 pr-7 rounded-full border transition-all cursor-pointer focus:outline-none ${
                isStateSelected
                  ? 'text-lime-300 border-lime-300/40 bg-[#163024]'
                  : 'text-sage-300 border-white/10 hover:border-white/25'
              }`}
            >
              <option value="" disabled className="bg-[#132820] text-sage-400">
                {isStateSelected ? `STATE: ${selectedStateName?.toUpperCase()}` : 'SELECT STATE (36 UTs)'}
              </option>
              {allIndianStates.map((st) => (
                <option key={st.id} value={st.id} className="bg-[#132820] text-white">
                  {st.label}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 pointer-events-none absolute right-2.5 ${isStateSelected ? 'text-lime-300' : 'text-sage-400'}`} />
          </div>

          {/* Responsive Segmented Persona Switcher (Admin HUD | Citizen View) */}
          <div className="flex items-center bg-[#10231c] p-0.5 rounded-full border border-white/10">
            <button
              onClick={() => setActivePersona('admin')}
              className={`text-[10px] font-mono px-3 py-1 rounded-full transition-all cursor-pointer ${
                activePersona === 'admin'
                  ? 'bg-[#183428] text-lime-300 font-bold shadow-sm border border-lime-300/30'
                  : 'text-sage-400 hover:text-white'
              }`}
            >
              ADMIN HUD
            </button>
            <button
              onClick={() => setActivePersona('citizen')}
              className={`text-[10px] font-mono px-3 py-1 rounded-full transition-all cursor-pointer ${
                activePersona === 'citizen'
                  ? 'bg-[#183428] text-lime-300 font-bold shadow-sm border border-lime-300/30'
                  : 'text-sage-400 hover:text-white'
              }`}
            >
              CITIZEN
            </button>
          </div>
        </nav>

        {/* Right: Clean Flat Controls (No Frosted Glass) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-sage-300 bg-[#132820] border border-white/10 px-3 py-1.5 rounded-full">
            <span className="pulse-lime"></span>
            <span>WBGT {weather?.wbgt_c ?? 33.8}°C</span>
            <span className="text-white/20">|</span>
            <span className="text-lime-300/90 text-[11px] uppercase tracking-wider">HIGH HEAT</span>
          </div>

          <button
            onClick={onOpenCoolPathModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-lime-300 bg-[#1a382b] border border-lime-300/30 hover:bg-[#204535] transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="tracking-wide">CoolPath</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-[#1a382b] hover:bg-[#204535] border border-white/10 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="tracking-wide">SOS</span>
          </button>

          <button
            onClick={onOpenWhatIfModal}
            title="What-If Simulation Sandbox"
            className="p-1.5 text-sage-300 hover:text-white bg-[#132820] hover:bg-[#183328] rounded-lg transition-colors border border-white/10 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
