import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';

// Minimalist custom divIcons matching the moss/lime aesthetic
const createShelterIcon = () => {
  return L.divIcon({
    className: 'custom-shelter-marker',
    html: `
      <div style="
        background: #18342a;
        color: #dff279;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        border: 1.5px solid #dff279;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        cursor: pointer;
      ">
        ❄
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

const createReportIcon = () => {
  return L.divIcon({
    className: 'custom-report-marker',
    html: `
      <div style="
        background: #dff279;
        color: #132820;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        border: 2px solid #ffffff;
        box-shadow: 0 0 10px rgba(223, 242, 121, 0.8);
        cursor: pointer;
      ">
        !
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

// Map controller component for smooth centering
const MapController = ({ activeWard, gridData }) => {
  const map = useMap();

  useEffect(() => {
    if (activeWard && activeWard !== 'All' && gridData?.features) {
      const match = gridData.features.find((f) => f.properties.ward === activeWard);
      if (match && match.geometry.coordinates[0]?.[0]) {
        const [lng, lat] = match.geometry.coordinates[0][0];
        map.flyTo([lat, lng], 14, { duration: 1.2 });
      }
    } else if (activeWard === 'All') {
      map.flyTo([19.0520, 72.8650], 13, { duration: 1.2 });
    }
  }, [activeWard, gridData, map]);

  return null;
};

export const MapView = ({
  gridData,
  shelters,
  reports,
  selectedZone,
  onSelectZone,
  activeWard
}) => {
  // Natural gradient palette matching the uploaded reference image:
  // Low: Deep Forest (#2f523c) -> Moderate: (#5a7d4a) -> High: (#9fbc62) -> Critical: Pale Lime (#dff279)
  const getFeatureStyle = (properties) => {
    const isSelected = selectedZone?.zone_id === properties.zone_id;
    const score = properties.chrs_risk_score;

    let fillColor = '#2f523c';
    let fillOpacity = 0.82;

    if (score >= 85) {
      fillColor = '#dff279'; // Luminous Pale Chartreuse (Critical Hotspot)
      fillOpacity = 0.92;
    } else if (score >= 75) {
      fillColor = '#cbe06c'; // Warm Lime
      fillOpacity = 0.88;
    } else if (score >= 50) {
      fillColor = '#8fae58'; // Olive Green
      fillOpacity = 0.82;
    } else {
      fillColor = '#3b684b'; // Deep Forest Green (Low Risk / High Resilient Canopy)
      fillOpacity = 0.80;
    }

    return {
      fillColor,
      fillOpacity,
      color: isSelected ? '#ffffff' : '#132820',
      weight: isSelected ? 2.5 : 1.2,
      opacity: 0.95
    };
  };

  return (
    <div className="relative w-full h-[580px] lg:h-[620px] rounded-xl overflow-hidden bg-[#132820]/40">
      {/* Primary Leaflet Canvas */}
      <MapContainer
        center={[19.0520, 72.8650]}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController activeWard={activeWard} gridData={gridData} />

        {/* 500m Micro-Grid Polygons */}
        {gridData?.features?.map((feature) => {
          const coords = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
          const props = feature.properties;

          return (
            <Polygon
              key={feature.id}
              positions={coords}
              pathOptions={getFeatureStyle(props)}
              eventHandlers={{
                click: () => onSelectZone(props)
              }}
            >
              <Tooltip sticky direction="top" className="custom-leaflet-tooltip">
                <div className="p-1 font-sans text-xs">
                  <strong className="text-white block font-display">{props.name}</strong>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono">
                    <span className="text-lime-300 font-bold">CHRS: {props.chrs_risk_score}</span>
                    <span className="text-sage-200">LST: {props.lst_celsius}°C</span>
                  </div>
                  <span className="text-[10px] text-lime-300/80 block mt-0.5">Click for factor breakdown &rarr;</span>
                </div>
              </Tooltip>
            </Polygon>
          );
        })}

        {/* Verified Cooling Shelters */}
        {shelters?.map((shelter) => (
          <Marker
            key={shelter.id}
            position={[shelter.location.lat, shelter.location.lng]}
            icon={createShelterIcon()}
          >
            <Popup>
              <div className="text-xs p-1 text-sage-100 font-sans">
                <div className="flex items-center gap-1 text-lime-300 font-bold mb-1">
                  <span>❄ {shelter.name}</span>
                </div>
                <p className="text-sage-300 text-[11px] mb-1">{shelter.address}</p>
                <div className="text-[10px] text-sage-400 font-mono">
                  Capacity: <strong>{shelter.capacity}</strong> | Status: <strong className="text-lime-300">{shelter.status}</strong>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Citizen SOS Reports */}
        {reports?.map((report) => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            icon={createReportIcon()}
          >
            <Popup>
              <div className="text-xs p-1 text-sage-100 font-sans">
                <div className="font-bold text-lime-300 mb-1">
                  🚨 {report.category} ({report.urgency})
                </div>
                <p className="text-sage-200 text-[11px] mb-1">{report.description}</p>
                {report.ai_triage?.recommended_action && (
                  <div className="text-[10px] text-sage-300 font-mono mt-1 border-t border-white/10 pt-1">
                    <strong>Action:</strong> {report.ai_triage.recommended_action}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Minimalist Legend Bar matching the reference photo */}
      <div className="absolute bottom-6 right-6 z-[1000] flex items-center gap-3 bg-[#132820]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.08] shadow-lg pointer-events-none">
        <span className="text-[10px] font-mono tracking-widest text-sage-400 uppercase">LOW</span>
        <div className="w-24 h-2 rounded-full bg-gradient-to-r from-[#2f523c] via-[#8fae58] to-[#dff279]"></div>
        <span className="text-[10px] font-mono tracking-widest text-lime-300 uppercase font-semibold">HIGH</span>
      </div>
    </div>
  );
};
