import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { ThreeMapView } from './components/map/ThreeMapView.jsx';
import { RegionTelemetryDrawer } from './components/RegionTelemetryDrawer.jsx';
import { RightTelemetryCard } from './components/RightTelemetryCard.jsx';
import { CitizenMobileView } from './components/CitizenMobileView.jsx';
import { XaiDrawer } from './components/XaiDrawer.jsx';
import { WhatIfSimulator } from './components/WhatIfSimulator.jsx';
import { CoolPathModal } from './components/CoolPathModal.jsx';
import { ReportModal } from './components/ReportModal.jsx';
import { api } from './services/api.js';

export const App = () => {
  const [activeWard, setActiveWard] = useState('india');
  const [activePersona, setActivePersona] = useState('admin'); // 'admin' | 'citizen'
  const [weather, setWeather] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [reports, setReports] = useState([]);

  const [selectedZone, setSelectedZone] = useState({
    id: 'india',
    name: 'India',
    level: 'country'
  });
  const [isXaiOpen, setIsXaiOpen] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isCoolPathOpen, setIsCoolPathOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Navbar visibility state: slides up during map interaction, down on top hover
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const isHoveringNavbarRef = useRef(false);

  const mapEngineRef = useRef(null);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [weatherRes, shelterRes, reportRes] = await Promise.all([
          api.getCurrentWeather(),
          api.getCoolingCenters(),
          api.getCitizenReports()
        ]);
        setWeather(weatherRes);
        setShelters(shelterRes);
        setReports(reportRes);
      } catch (err) {
        console.error('Error fetching platform data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Global mousemove tracker: when cursor is near the top (within 75px), slide navbar down!
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientY < 75) {
        setIsNavbarVisible(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // When user interacts with the map (wheel / pan): slide navbar up unless mouse is on navbar
  const handleMapInteract = () => {
    if (!isHoveringNavbarRef.current) {
      setIsNavbarVisible(false);
    }
  };

  const handleReportSubmitted = (newReport) => {
    setReports((prev) => [newReport, ...prev]);
    setIsReportModalOpen(false);
  };

  const handleFocusRegionChange = (region) => {
    if (!region) return;
    setActiveWard(region.id);
    setSelectedZone({
      ...(region.properties || {}),
      id: region.id,
      name: region.name,
      level: region.level
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#132820] text-sage-100 font-sans select-none">
      {/* Invisible Top Hover Trigger Zone */}
      <div
        onMouseEnter={() => setIsNavbarVisible(true)}
        className="fixed top-0 left-0 right-0 h-4 z-40 pointer-events-auto"
      />

      {/* Floating Animated Navbar (Clean flat transparent, slides up/down) */}
      <Navbar
        isVisible={isNavbarVisible}
        onMouseEnter={() => {
          isHoveringNavbarRef.current = true;
          setIsNavbarVisible(true);
        }}
        onMouseLeave={() => {
          isHoveringNavbarRef.current = false;
        }}
        activeWard={activeWard}
        setActiveWard={(wardId) => {
          setActiveWard(wardId);
          mapEngineRef.current?.focusRegion(wardId, { animateZoom: true, force: true });
        }}
        activePersona={activePersona}
        setActivePersona={setActivePersona}
        weather={weather}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenCoolPathModal={() => setIsCoolPathOpen(true)}
        onOpenWhatIfModal={() => setIsWhatIfOpen(true)}
      />

      {/* Admin Persona: Dual Side Telemetry Drawers */}
      {activePersona === 'admin' && (
        <>
          {/* Floating Regional Profile (Slides from LEFT on region change) */}
          <RegionTelemetryDrawer
            activeRegion={selectedZone}
            onOpenXai={() => setIsXaiOpen(true)}
            onOpenSimulator={() => setIsWhatIfOpen(true)}
            onOpenCoolPath={() => setIsCoolPathOpen(true)}
          />

          {/* Floating Live Telemetry & Resilience (Slides from RIGHT on region change) */}
          <RightTelemetryCard
            activeRegion={selectedZone}
            shelters={shelters}
            reports={reports}
            weather={weather}
            onResetIndia={() => {
              setActiveWard('india');
              mapEngineRef.current?.resetView();
            }}
          />
        </>
      )}

      {/* Citizen Persona: Emergency Cooling & Hydration Portal */}
      {activePersona === 'citizen' && (
        <div className="fixed inset-0 top-20 z-40 overflow-y-auto px-4 py-6 bg-[#132820]/95 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-400">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-300 animate-ping"></span>
                <span className="text-xs font-mono tracking-widest text-lime-300 uppercase font-bold">
                  CITIZEN RELIEF & ADVISORY PORTAL
                </span>
              </div>
              <button
                onClick={() => setActivePersona('admin')}
                className="text-xs font-mono uppercase tracking-wider text-sage-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-full border border-white/10 transition-all cursor-pointer"
              >
                RETURN TO ADMIN HUD
              </button>
            </div>

            <CitizenMobileView
              shelters={shelters}
              onOpenCoolPathModal={() => setIsCoolPathOpen(true)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Full-Screen Map Container (100% viewport) */}
      <main className="absolute inset-0 w-full h-full">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-lime-300 border-t-transparent animate-spin"></div>
              <span className="text-xs font-mono tracking-widest text-lime-300 uppercase">
                Loading Three.js Geospatial Engine...
              </span>
            </div>
          </div>
        ) : (
          <ThreeMapView
            activeRegionId={activeWard}
            onSelectRegion={(region) => {
              setSelectedZone({
                ...(region.properties || {}),
                id: region.id,
                name: region.name,
                level: region.level
              });
              if (region.level === 'microgrid') {
                setIsXaiOpen(true);
              }
            }}
            onFocusRegionChange={handleFocusRegionChange}
            mapEngineRef={mapEngineRef}
            onUserInteract={handleMapInteract}
          />
        )}
      </main>

      {/* Slide-out Explainable AI (XAI) Drawer */}
      <XaiDrawer
        isOpen={isXaiOpen}
        selectedZone={selectedZone}
        onClose={() => setIsXaiOpen(false)}
        onOpenSimulator={(zone) => {
          setSelectedZone(zone);
          setIsXaiOpen(false);
          setIsWhatIfOpen(true);
        }}
      />

      {/* Urban Policy "What-If" Simulator Modal */}
      {isWhatIfOpen && (
        <WhatIfSimulator
          zone={selectedZone}
          onClose={() => setIsWhatIfOpen(false)}
        />
      )}

      {/* CoolPath Microclimate Route Modal */}
      {isCoolPathOpen && (
        <CoolPathModal
          onClose={() => setIsCoolPathOpen(false)}
        />
      )}

      {/* Citizen SOS Distress Report Modal */}
      {isReportModalOpen && (
        <ReportModal
          onClose={() => setIsReportModalOpen(false)}
          onReportSubmitted={handleReportSubmitted}
        />
      )}
    </div>
  );
};
