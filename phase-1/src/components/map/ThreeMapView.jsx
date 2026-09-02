import React, { useRef, useEffect, useState } from 'react';
import { MapEngine } from './engine/MapEngine.js';
import { Plus, Minus, Layers, Flame, TreeDeciduous, ShieldAlert } from 'lucide-react';

export const ThreeMapView = ({
  activeRegionId,
  onSelectRegion,
  onFocusRegionChange,
  mapEngineRef,
  onUserInteract
}) => {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [currentFocus, setCurrentFocus] = useState({ name: 'INDIA', level: 'COUNTRY' });
  const [activeLayer, setActiveLayer] = useState(null); // null = Clean default green, no filter active

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new MapEngine(containerRef.current, {
      onSelectRegion: (region) => {
        if (onSelectRegion) {
          onSelectRegion(region);
        }
      }
    });

    engineRef.current = engine;
    if (mapEngineRef) {
      mapEngineRef.current = engine;
    }

    engine.focusManager.onFocusChange((region) => {
      setCurrentFocus(region);
      if (onFocusRegionChange) {
        onFocusRegionChange(region);
      }
    });

    // Notify parent on map interaction to trigger navbar slide-up
    const handleInteraction = () => {
      if (onUserInteract) onUserInteract();
    };

    const containerEl = containerRef.current;
    containerEl.addEventListener('wheel', handleInteraction, { passive: true });
    containerEl.addEventListener('pointerdown', handleInteraction);

    return () => {
      containerEl.removeEventListener('wheel', handleInteraction);
      containerEl.removeEventListener('pointerdown', handleInteraction);
      engine.dispose();
      engineRef.current = null;
      if (mapEngineRef) {
        mapEngineRef.current = null;
      }
    };
  }, []);

  // Sync external region changes (e.g. Navbar click)
  useEffect(() => {
    if (engineRef.current && activeRegionId) {
      engineRef.current.focusRegion(activeRegionId, { animateZoom: true, force: true });
    }
  }, [activeRegionId]);

  const handleLayerSwitch = (layer) => {
    if (activeLayer === layer) {
      // Toggle off back to clean default green
      setActiveLayer(null);
      engineRef.current?.setMapLayer('default');
    } else {
      setActiveLayer(layer);
      engineRef.current?.setMapLayer(layer);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#132820] select-none">
      {/* Three.js WebGL Canvas Mount Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* Screen 1: Map Layer Switcher Pill (Floating Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center bg-[#10231c] p-1 rounded-full border border-white/10 shadow-2xl space-x-1 pointer-events-auto">
        <button
          onClick={() => handleLayerSwitch('chrs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
            activeLayer === 'chrs'
              ? 'bg-[#183428] text-lime-300 font-bold border border-lime-300/30 shadow-md'
              : 'text-sage-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-lime-300" />
          <span>Heat Risk (CHRS)</span>
        </button>

        <button
          onClick={() => handleLayerSwitch('lst')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
            activeLayer === 'lst'
              ? 'bg-[#183428] text-red-400 font-bold border border-red-400/30 shadow-md'
              : 'text-sage-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span>Surface Temp (LST)</span>
        </button>

        <button
          onClick={() => handleLayerSwitch('ndvi')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
            activeLayer === 'ndvi'
              ? 'bg-[#183428] text-green-400 font-bold border border-green-400/30 shadow-md'
              : 'text-sage-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <TreeDeciduous className="w-3.5 h-3.5 text-green-400" />
          <span>Vegetation (NDVI)</span>
        </button>
      </div>

      {/* Right Edge: Minimal Zoom Pill (Clean Flat) */}
      <div className="absolute right-6 bottom-16 z-20 flex flex-col items-center bg-[#10231c] border border-white/10 rounded-full p-1 text-sage-300 shadow-xl">
        <button
          onClick={() => engineRef.current?.zoomIn()}
          title="Zoom In"
          className="p-2 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <div className="w-3 h-[1px] bg-white/10 my-0.5"></div>
        <button
          onClick={() => engineRef.current?.zoomOut()}
          title="Zoom Out"
          className="p-2 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Left: Active Focus Breadcrumb Badge (Clean Flat) */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 bg-[#10231c] px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono text-sage-300 pointer-events-none shadow-md transition-all">
        <span className="w-2 h-2 rounded-full bg-lime-300 animate-pulse"></span>
        <span className="uppercase tracking-widest text-[10px] text-lime-300 font-bold">
          FOCUS:
        </span>
        <span className="text-white font-semibold uppercase tracking-wider">
          {currentFocus?.name || 'INDIA'}
        </span>
        <span className="text-white/20">|</span>
        <span className="text-[10px] text-sage-400 uppercase font-mono">
          {currentFocus?.level || 'COUNTRY'}
        </span>
      </div>

      {/* Bottom Right: Dynamic Legend Bar (Only appears when a layer is active) */}
      {activeLayer && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3 bg-[#10231c] px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg pointer-events-none animate-in fade-in duration-300">
          <span className="text-[10px] font-mono tracking-widest text-sage-400 uppercase">
            {activeLayer === 'chrs' ? 'SAFE' : (activeLayer === 'lst' ? '< 38°C' : '< 5% VEG')}
          </span>
          <div
            className={`w-28 h-2 rounded-full ${
              activeLayer === 'chrs'
                ? 'bg-gradient-to-r from-lime-400 via-amber-400 to-red-500'
                : (activeLayer === 'lst'
                    ? 'bg-gradient-to-r from-yellow-300 via-orange-500 to-red-700'
                    : 'bg-gradient-to-r from-amber-700 via-yellow-600 to-green-500')
            }`}
          ></div>
          <span className="text-[10px] font-mono tracking-widest text-lime-300 uppercase font-semibold">
            {activeLayer === 'chrs' ? 'CRITICAL' : (activeLayer === 'lst' ? '> 45°C' : '> 25% CANOPY')}
          </span>
        </div>
      )}
    </div>
  );
};
