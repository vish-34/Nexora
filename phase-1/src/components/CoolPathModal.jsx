import React, { useState } from 'react';
import { X, Navigation, ArrowRight, Droplets, CheckCircle2, ShieldAlert } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const waypointIcon = L.divIcon({
  className: 'coolpath-pin',
  html: `<div style="background:#dff279; width:14px; height:14px; border-radius:50%; border:2px solid #132820; box-shadow:0 0 8px rgba(223, 242, 121, 0.8);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const startIcon = L.divIcon({
  className: 'start-pin',
  html: `<div style="background:#ffffff; width:16px; height:16px; border-radius:50%; border:2px solid #132820;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const endIcon = L.divIcon({
  className: 'end-pin',
  html: `<div style="background:#dff279; width:22px; height:22px; border-radius:50%; border:2px solid #132820; display:flex; align-items:center; justify-content:center; font-size:11px; color:#132820; font-weight:bold;">❄</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

export const CoolPathModal = ({ onClose }) => {
  const [selectedPath, setSelectedPath] = useState('coolest');
  const [navigating, setNavigating] = useState(false);

  const shortestCoords = [
    [19.0405, 72.8525],
    [19.0440, 72.8550],
    [19.0485, 72.8585]
  ];

  const coolestCoords = [
    [19.0405, 72.8525],
    [19.0430, 72.8532],
    [19.0465, 72.8560],
    [19.0485, 72.8585]
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-[#10231c] border border-white/10 rounded-2xl shadow-2xl p-7 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-300/10 text-lime-300">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display uppercase tracking-wide">
                  CoolPath Microclimate Route Navigator
                </h3>
                <span className="text-[10px] font-mono text-lime-300 bg-[#183428] px-2 py-0.5 rounded border border-lime-300/20">
                  SHADE-OPTIMIZED
                </span>
              </div>
              <p className="text-xs text-sage-400">
                Origin: <strong className="text-white">Dharavi 60 Feet Road</strong> &rarr; Destination: <strong className="text-lime-300">Municipal Cooling Center</strong>
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

        {/* Comparison Cards: Route A vs Route B */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Route A: Shortest */}
          <div
            onClick={() => setSelectedPath('shortest')}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedPath === 'shortest'
                ? 'bg-[#18342a] border-white/40 shadow-lg'
                : 'bg-[#142b22] border-white/[0.06] opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Route A: Shortest Path
              </span>
              <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                HIGH HEAT EXPOSURE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center my-3">
              <div className="bg-black/20 p-2 rounded">
                <span className="text-[10px] text-sage-400 block font-mono">Distance</span>
                <span className="text-sm font-bold text-white font-display">1,150 m</span>
              </div>
              <div className="bg-black/20 p-2 rounded">
                <span className="text-[10px] text-sage-400 block font-mono">Time</span>
                <span className="text-sm font-bold text-white font-display">14 mins</span>
              </div>
              <div className="bg-black/20 p-2 rounded">
                <span className="text-[10px] text-sage-400 block font-mono">Exposure</span>
                <span className="text-sm font-bold text-red-400 font-display">43.1°C</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-sage-300">
              <div className="flex justify-between">
                <span>Canopy Shade:</span>
                <strong className="text-red-400 font-mono">8% (92% Unshaded Sun)</strong>
              </div>
              <div className="flex justify-between">
                <span>Water Facilities:</span>
                <strong className="text-sage-400 font-mono">0 Kiosks</strong>
              </div>
            </div>
          </div>

          {/* Route B: CoolPath */}
          <div
            onClick={() => setSelectedPath('coolest')}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedPath === 'coolest'
                ? 'bg-[#18342a] border-lime-300/60 shadow-lg'
                : 'bg-[#142b22] border-white/[0.06] opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Route B: CoolPath (Recommended)
              </span>
              <span className="text-[10px] font-mono text-lime-300 bg-lime-300/10 px-2 py-0.5 rounded border border-lime-300/20 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                RECOMMENDED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center my-3">
              <div className="bg-black/20 p-2 rounded">
                <span className="text-[10px] text-sage-400 block font-mono">Distance</span>
                <span className="text-sm font-bold text-white font-display">1,320 m</span>
              </div>
              <div className="bg-black/20 p-2 rounded">
                <span className="text-[10px] text-sage-400 block font-mono">Time</span>
                <span className="text-sm font-bold text-white font-display">16 mins</span>
              </div>
              <div className="bg-black/20 p-2 rounded">
                <span className="text-[10px] text-sage-400 block font-mono">Perceived</span>
                <span className="text-sm font-bold text-lime-300 font-display">38.6°C</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-sage-300">
              <div className="flex justify-between">
                <span>Canopy Shade:</span>
                <strong className="text-lime-300 font-mono">74.5% Shaded Tree Canopy</strong>
              </div>
              <div className="flex justify-between">
                <span>Water Facilities:</span>
                <strong className="text-lime-300 font-mono flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  2 Emergency Water Kiosks
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Recommendation Callout */}
        <div className="bg-[#183428] border border-lime-300/30 p-2.5 rounded-xl mb-3 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-lime-300 shrink-0" />
          <span className="text-sage-200">
            <strong className="text-white">Recommendation:</strong> CoolPath is 170m longer, but substantially reduces heat exposure (-4.5°C perceived thermal relief) with guaranteed drinking water along the way.
          </span>
        </div>

        {/* Embedded Leaflet Map */}
        <div className="w-full h-48 rounded-xl overflow-hidden border border-white/[0.08] relative mb-3">
          <MapContainer
            center={[19.0445, 72.8555]}
            zoom={15}
            scrollWheelZoom={false}
            zoomControl={false}
            style={{ width: '100%', height: '100%', background: '#132820' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Polyline
              positions={shortestCoords}
              pathOptions={{
                color: '#ef4444',
                weight: selectedPath === 'shortest' ? 4 : 2,
                opacity: selectedPath === 'shortest' ? 0.9 : 0.3,
                dashArray: '5, 5'
              }}
            />

            <Polyline
              positions={coolestCoords}
              pathOptions={{
                color: '#dff279',
                weight: selectedPath === 'coolest' ? 5 : 2.5,
                opacity: selectedPath === 'coolest' ? 1.0 : 0.4
              }}
            />

            <Marker position={[19.0405, 72.8525]} icon={startIcon}>
              <Popup><span className="text-xs font-sans">Start Point</span></Popup>
            </Marker>
            <Marker position={[19.0485, 72.8585]} icon={endIcon}>
              <Popup><span className="text-xs font-sans">Cooling Center</span></Popup>
            </Marker>
            <Marker position={[19.0445, 72.8545]} icon={waypointIcon}>
              <Popup><span className="text-xs font-sans">Water Kiosk</span></Popup>
            </Marker>
          </MapContainer>

          <div className="absolute bottom-2 right-2 z-[1000] bg-[#10231c]/95 px-3 py-1 rounded-full text-[10px] font-mono text-sage-300 border border-white/10 shadow-md">
            <span className="text-red-400 font-bold">┄ Route A (Hot)</span> | <span className="text-lime-300 font-bold">━ Route B (CoolPath)</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <span className="text-[11px] text-sage-400 font-mono">
            OSM road network penalized by high-LST and unshaded segments.
          </span>
          <button
            onClick={() => setNavigating(true)}
            className="px-5 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-[#10231c] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <span>{navigating ? 'Navigation Active &rarr;' : 'Begin CoolPath Navigation'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
