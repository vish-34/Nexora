import React, { useRef, useEffect, useState } from 'react';
import { MapEngine } from './engine/MapEngine.js';
import { MapPinsOverlay } from './pins/MapPinsOverlay.jsx';
import { Plus, Minus } from 'lucide-react';

export const ThreeMapView = ({
  activeRegionId,
  activeRegion,
  activeLayer: externalActiveLayer,
  onLayerChange,
  onSelectRegion,
  onFocusRegionChange,
  onInspectPin,
  mapEngineRef,
  onUserInteract
}) => {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [currentFocus, setCurrentFocus] = useState(null);
  const [internalActiveLayer, setInternalActiveLayer] = useState(null);

  const activeLayer = externalActiveLayer !== undefined ? externalActiveLayer : internalActiveLayer;
  const setActiveLayer = onLayerChange || setInternalActiveLayer;

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new MapEngine(containerRef.current, {
      onSelectRegion: (region) => {
        if (region) {
          setCurrentFocus(region);
        }
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
    containerEl.addEventListener('pointerdown', handleInteraction, { passive: true });

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

  // Sync layer changes from AI Copilot or external state
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setMapLayer(activeLayer || 'default');
    }
  }, [activeLayer]);

  const handleLayerSwitch = (layer) => {
    const nextLayer = activeLayer === layer ? null : layer;
    setActiveLayer(nextLayer);
    engineRef.current?.setMapLayer(nextLayer || 'default');
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f8fafc] select-none">
      {/* Three.js WebGL Canvas Mount Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* Hierarchical Multi-Polygon Pins Overlay (Level 1: Country -> Level 2: State -> Level 3: District) */}
      <MapPinsOverlay
        activeRegion={currentFocus || activeRegion || { id: activeRegionId || 'india', level: activeRegionId === 'india' ? 'country' : 'state' }}
        mapEngineRef={engineRef}
        containerRef={containerRef}
        onInspectPin={onInspectPin}
      />

      {/* Screen 1: Map Layer Switcher Pill Matching Reference Image */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center bg-white/95 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-x-6 pointer-events-auto">
        <button
          onClick={() => handleLayerSwitch('chrs')}
          className={`flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeLayer === 'chrs'
              ? 'text-slate-950 font-bold scale-105'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
          <span>HEAT RISK (CHRS)</span>
        </button>

        <button
          onClick={() => handleLayerSwitch('lst')}
          className={`flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeLayer === 'lst'
              ? 'text-slate-950 font-bold scale-105'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
          <span>SURFACE TEMP (LST)</span>
        </button>

        <button
          onClick={() => handleLayerSwitch('ndvi')}
          className={`flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeLayer === 'ndvi'
              ? 'text-slate-950 font-bold scale-105'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0"></span>
          <span>VEGETATION (NDVI)</span>
        </button>
      </div>

      {/* Right Edge: Minimal Zoom Pill (Clean White Capsule Matching Reference) */}
      <div className="absolute right-6 bottom-20 z-20 flex flex-col items-center bg-white border border-slate-200/90 rounded-xl p-1 text-slate-700 shadow-md">
        <button
          onClick={() => engineRef.current?.zoomIn()}
          title="Zoom In"
          className="p-1.5 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="w-3 h-[1px] bg-slate-200 my-0.5"></div>
        <button
          onClick={() => engineRef.current?.zoomOut()}
          title="Zoom Out"
          className="p-1.5 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Right: Dynamic Legend Bar (Only appears when a layer is active) */}
      {activeLayer && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-white/95 px-4 py-1.5 rounded-full border border-slate-200/90 shadow-md pointer-events-none animate-in fade-in duration-300">
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold">
            {activeLayer === 'chrs' ? 'SAFE' : (activeLayer === 'lst' ? '< 38°C' : '< 5% VEG')}
          </span>
          <div
            className={`w-28 h-2 rounded-full ${
              activeLayer === 'chrs'
                ? 'bg-gradient-to-r from-green-500 via-amber-400 to-red-500'
                : (activeLayer === 'lst'
                    ? 'bg-gradient-to-r from-slate-400 via-orange-400 to-red-600'
                    : 'bg-gradient-to-r from-amber-600 via-lime-500 to-emerald-600')
            }`}
          ></div>
          <span className="text-[10px] font-mono tracking-widest text-slate-900 uppercase font-bold">
            {activeLayer === 'chrs' ? 'CRITICAL' : (activeLayer === 'lst' ? '> 46°C' : '> 35% CANOPY')}
          </span>
        </div>
      )}
    </div>
  );
};
