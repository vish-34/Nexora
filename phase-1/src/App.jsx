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
import { SosDistressModal } from './components/SosDistressModal.jsx';
import { AiCopilotCard } from './components/AiCopilotCard.jsx';
import { api } from './services/api.js';
import { HeroLanding, AuthModal } from './login/index.js';

export const App = () => {
  const [currentUser, setCurrentUser] = useState(() => api.getStoredUser());
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const [activeWard, setActiveWard] = useState('india');
  const [activePersona, setActivePersona] = useState('admin'); // 'admin' | 'citizen'
  const [activeLayer, setActiveLayer] = useState(null); // null = default clean, 'chrs' | 'lst' | 'ndvi'
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
  const [selectedPin, setSelectedPin] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDistressFeedOpen, setIsDistressFeedOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Navbar visibility state: slides up during map interaction, down on top hover
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const isHoveringNavbarRef = useRef(false);

  const mapEngineRef = useRef(null);

  const [aiStatus, setAiStatus] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [weatherRes, shelterRes, reportRes, aiRes] = await Promise.all([
          api.getCurrentWeather(),
          api.getCoolingCenters(),
          api.getCitizenReports(),
          api.getAiStatus()
        ]);
        setWeather(weatherRes);
        setShelters(shelterRes);
        setReports(reportRes);
        setAiStatus(aiRes);
      } catch (err) {
        console.error('Error fetching platform data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Establish WebSocket Connection to Phase 2 Gateway for real-time SOS distress broadcasts
    let ws = null;
    try {
      const wsUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/^http/, 'ws');
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload.event === 'distress_report_created' ||
            payload.event === 'new_report' ||
            payload.event === 'report_created'
          ) {
            const incoming = payload.data || payload.report;
            if (incoming) {
              setReports((prev) => [incoming, ...prev]);
            }
          }
        } catch (e) {
          // ignore keepalive messages
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
      };
    } catch (err) {
      console.warn('WebSocket not supported or server unavailable:', err);
    }

    return () => {
      if (ws) ws.close();
    };
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

  const handleInspectPin = (pin) => {
    if (!pin) return;
    setSelectedPin(pin);

    if (pin.action_type === 'xai' || pin.type === 'hotspot' || pin.type === 'vulnerability') {
      setSelectedZone({
        id: pin.id,
        name: pin.name,
        level: pin.level || 'district',
        lst_celsius: pin.lst_celsius,
        chrs_risk_score: pin.heat_risk,
        canopy_cover_pct: pin.tree_count ? Math.min(35, Math.round(pin.tree_count / 100)) : 10,
        tree_count: pin.tree_count,
        tree_source: pin.tree_source,
        region: pin.details
      });
      setIsXaiOpen(true);
    } else if (pin.action_type === 'coolpath' || pin.type === 'cooling_centre') {
      setIsCoolPathOpen(true);
    } else if (pin.action_type === 'report' || pin.type === 'citizen_report') {
      setIsDistressFeedOpen(true);
    } else if (pin.action_type === 'whatif' || pin.type === 'low_veg' || pin.type === 'water_needed') {
      setSelectedZone({
        id: pin.id,
        name: pin.name,
        level: pin.level || 'district',
        lst_celsius: pin.lst_celsius,
        chrs_risk_score: pin.heat_risk,
        tree_count: pin.tree_count
      });
      setIsWhatIfOpen(true);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans select-none">
      {/* Full-Screen Landing Page Overlay (3D Engine Preloaded in Background on Site Load) */}
      <div
        className={`fixed inset-0 z-40 bg-[#f8fafc] overflow-hidden transition-all duration-500 ease-in-out ${
          currentView === 'landing'
            ? 'opacity-100 pointer-events-auto visible scale-100'
            : 'opacity-0 pointer-events-none invisible scale-[0.99]'
        }`}
      >
        <HeroLanding
          onExploreMap={() => setCurrentView('app')}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onOpenSolutions={() => {
            setActiveLayer('chrs');
            setCurrentView('app');
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Invisible Top Hover Trigger Zone */}
      <div
        onMouseEnter={() => setIsNavbarVisible(true)}
        className="fixed top-0 left-0 right-0 h-4 z-40 pointer-events-auto"
      />

      {/* Floating Animated Navbar (Visible when in App view) */}
      <Navbar
        isVisible={isNavbarVisible && currentView === 'app'}
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
        aiStatus={aiStatus}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenCoolPathModal={() => setIsCoolPathOpen(true)}
        onOpenWhatIfModal={() => setIsWhatIfOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
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
            aiStatus={aiStatus}
            onOpenCoolPath={() => setIsCoolPathOpen(true)}
            onOpenDistressFeed={() => setIsDistressFeedOpen(true)}
            onResetIndia={() => {
              setActiveWard('india');
              mapEngineRef.current?.resetView();
            }}
          />
        </>
      )}

      {/* Citizen Persona: Emergency Cooling & Hydration Portal */}
      {activePersona === 'citizen' && (
        <div className="fixed inset-0 top-16 z-40 overflow-y-auto px-4 py-6 bg-slate-900/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-400">
          <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-mono tracking-widest text-slate-800 uppercase font-bold">
                  CITIZEN RELIEF & ADVISORY PORTAL
                </span>
              </div>
              <button
                onClick={() => setActivePersona('admin')}
                className="text-xs font-mono uppercase tracking-wider text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full border border-slate-200 transition-all cursor-pointer font-bold"
              >
                RETURN TO ADMIN HUD
              </button>
            </div>

            <CitizenMobileView
              shelters={shelters}
              reports={reports}
              onOpenCoolPathModal={() => setIsCoolPathOpen(true)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenDistressFeed={() => setIsDistressFeedOpen(true)}
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
            activeRegion={selectedZone}
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
            onInspectPin={handleInspectPin}
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

      {/* AI Climate Copilot (Floating in Bottom-Right Corner in App view only) */}
      {currentView === 'app' && (
        <AiCopilotCard
          selectedZone={selectedZone}
          activeLayer={activeLayer}
          activePersona={activePersona}
          weather={weather}
          shelters={shelters}
          reports={reports}
          onSetMapLayer={(layer) => {
            setActiveLayer(layer === 'default' ? null : layer);
          }}
          onOpenXai={() => setIsXaiOpen(true)}
          onOpenSimulator={() => setIsWhatIfOpen(true)}
          onOpenCoolPath={() => setIsCoolPathOpen(true)}
          onSetPersona={setActivePersona}
          onResetIndia={() => {
            setActiveWard('india');
            setActiveLayer(null);
            mapEngineRef.current?.resetView();
          }}
          onFocusRegion={(regionId) => {
            setActiveWard(regionId);
            mapEngineRef.current?.focusRegion(regionId, { animateZoom: true, force: true });
          }}
        />
      )}

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
          activeRegion={selectedZone}
          selectedPin={selectedPin}
          onClose={() => setIsCoolPathOpen(false)}
        />
      )}

      {/* Citizen SOS Distress Report Modal */}
      {isReportModalOpen && (
        <ReportModal
          activeRegion={selectedZone}
          onClose={() => setIsReportModalOpen(false)}
          onReportSubmitted={handleReportSubmitted}
        />
      )}

      {/* Live Community Distress Feed Modal */}
      {isDistressFeedOpen && (
        <SosDistressModal
          reports={reports}
          onClose={() => setIsDistressFeedOpen(false)}
          onOpenReportModal={() => {
            setIsDistressFeedOpen(false);
            setIsReportModalOpen(true);
          }}
          onFocusReport={(report) => {
            const coords = report.location?.coordinates || [report.location?.lng, report.location?.lat];
            if (coords && coords[0]) {
              mapEngineRef.current?.cameraController?.panTo(coords[0], coords[1], 80);
            }
          }}
        />
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setCurrentView('app');
        }}
      />
    </div>
  );
};
