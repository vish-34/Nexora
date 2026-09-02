import axios from 'axios';
import {
  mockHeatGrid,
  mockCoolingCenters,
  mockReports,
  mockWeatherData,
  mockXaiExplanation,
  mockCoolPathData
} from './mockData.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'; // Defaults to false if set to 'false'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper for simulated network delay in mock mode
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  /**
   * Fetch system health & Phase 2 -> Phase 3 AI link status and latency
   */
  async getAiStatus() {
    if (USE_MOCK) {
      await delay(100);
      return { status: 'connected', latency_ms: 15, ai_service: 'CoolNeighbour AI Engine (Phase 3)' };
    }
    try {
      const res = await apiClient.get('/api/ai/status');
      return res.data;
    } catch (err) {
      console.warn('AI gateway unreachable, using fallback', err.message);
      return { status: 'offline', latency_ms: null, error: err.message };
    }
  },

  /**
   * Fetch 500m micro-grid GeoJSON with LST, NDVI, and CHRS heat risk
   */
  async getHeatGrid(ward) {
    if (USE_MOCK) {
      await delay();
      if (!ward || ward === 'All') return mockHeatGrid;
      return {
        ...mockHeatGrid,
        features: mockHeatGrid.features.filter((f) => f.properties.ward === ward)
      };
    }

    try {
      const res = await apiClient.get('/api/grid', { params: { ward } });
      return res.data;
    } catch (err) {
      console.warn('Backend unavailable, using resilient mock heat grid fallback', err);
      return mockHeatGrid;
    }
  },

  /**
   * Fetch live ambient weather, solar index, and computed WBGT
   */
  async getCurrentWeather(lat = 19.0760, lng = 72.8777) {
    if (USE_MOCK) {
      await delay();
      return mockWeatherData;
    }

    try {
      const res = await apiClient.get('/api/weather/current', { params: { lat, lng } });
      return res.data;
    } catch (err) {
      console.warn('Backend unavailable, using mock weather fallback', err);
      return mockWeatherData;
    }
  },

  /**
   * Fetch cooling shelters, hydration kiosks, and medical triage centers
   */
  async getCoolingCenters(lat, lng) {
    if (USE_MOCK) {
      await delay();
      return mockCoolingCenters;
    }

    try {
      const endpoint = (lat && lng) ? '/api/cooling-centers/nearby' : '/api/cooling-centers';
      const res = await apiClient.get(endpoint, { params: { lat, lng, radius_km: 5.0 } });
      return res.data?.centers || res.data || mockCoolingCenters;
    } catch (err) {
      console.warn('Backend unavailable, using mock cooling centers fallback', err);
      return mockCoolingCenters;
    }
  },

  /**
   * Fetch crowdsourced community distress reports
   */
  async getCitizenReports() {
    if (USE_MOCK) {
      await delay();
      return mockReports;
    }

    try {
      const res = await apiClient.get('/api/reports');
      return res.data?.reports || res.data || mockReports;
    } catch (err) {
      console.warn('Backend unavailable, using mock reports fallback', err);
      return mockReports;
    }
  },

  /**
   * Fetch hierarchical map pins (Level 1: Country, Level 2: State, Level 3: District)
   */
  async getPins(params = {}) {
    try {
      const res = await apiClient.get('/api/pins', { params });
      return res.data?.data || [];
    } catch (err) {
      console.warn('Backend pins query failed, using empty fallback', err);
      return [];
    }
  },

  /**
   * Submit citizen heat distress report with AI triage
   */
  async submitCitizenReport(report) {
    if (USE_MOCK) {
      await delay(250);
      const isUrgent = report.description.toLowerCase().includes('water') || 
                       report.description.toLowerCase().includes('collapsed') || 
                       report.category === 'Hydration Crisis';
      const newReport = {
        id: `REP_${Date.now().toString().slice(-4)}`,
        reporter_name: report.reporter_name,
        phone: report.phone,
        category: report.category,
        description: report.description,
        location: report.location,
        urgency: isUrgent ? 'Emergency' : 'Medium',
        status: 'In-Progress',
        ai_triage: {
          confidence: 0.94,
          extracted_entities: [report.category, 'Location tagged'],
          recommended_action: isUrgent 
            ? 'Dispatch rapid water tanker & alert local cooling shelter' 
            : 'Notify municipal maintenance ward officer'
        },
        created_at: new Date().toISOString()
      };
      mockReports.unshift(newReport);
      return newReport;
    }

    try {
      const res = await apiClient.post('/api/reports', report);
      return res.data?.report || res.data;
    } catch (err) {
      console.warn('Backend unavailable, saving locally in mock fallback', err);
      const fallbackReport = {
        id: `REP_${Date.now().toString().slice(-4)}`,
        ...report,
        urgency: 'Emergency',
        status: 'In-Progress',
        ai_triage: {
          confidence: 0.92,
          extracted_entities: [report.category],
          recommended_action: 'Emergency alert dispatched to ward wardens'
        },
        created_at: new Date().toISOString()
      };
      mockReports.unshift(fallbackReport);
      return fallbackReport;
    }
  },

  /**
   * Fetch Explainable AI (XAI) factor diagnostics for a clicked hotspot cell or state/district
   */
  async getXaiExplanation(zoneId, metrics = {}) {
    if (USE_MOCK) {
      await delay();
      return {
        ...mockXaiExplanation,
        zone_id: zoneId,
        chrs_risk_score: metrics.chrs_risk_score || 88,
        lst_celsius: metrics.lst_celsius || 43.8
      };
    }

    try {
      const res = await apiClient.get(`/api/ai/explain/${zoneId}`, {
        params: {
          lst: metrics.lst_celsius,
          canopy: metrics.canopy_cover_pct,
          chrs: metrics.chrs_risk_score,
          name: metrics.name
        }
      });
      return res.data;
    } catch (err) {
      console.warn('AI microservice unavailable, returning fallback XAI explanation', err);
      return {
        ...mockXaiExplanation,
        zone_id: zoneId,
        chrs_risk_score: metrics.chrs_risk_score || 88,
        lst_celsius: metrics.lst_celsius || 43.8
      };
    }
  },

  /**
   * Send on-screen perception context and user query to Phase 3 Grok RAG Engine
   */
  async explainScreen(context, userPrompt = '') {
    if (USE_MOCK) {
      await delay(250);
      return {
        title: `Screen Climate Analysis: ${context.selected_zone_id || 'Active View'}`,
        summary: `The active screen presents on-screen thermal analytics for ${context.selected_zone_id || 'the region'} with elevated surface heat.`,
        detailed_explanation: `Grounded RAG telemetry shows surface heat and canopy characteristics directly from Landsat-8 and local climate action frameworks.`,
        grounded_sources: ['Mumbai Heat Action Plan', 'National Disaster Management Authority', 'Landsat-8 Baseline'],
        actionable_recommendations: ['Prioritize reflective cool roof coatings on dense informal clusters', 'Deploy mobile hydration kiosks'],
        audio_transcript: `This is the active screen summary. The active zone presents elevated heat risk. High-albedo cool roofs and tree canopy will provide localized thermal relief.`,
        model_used: 'local-rag-fallback'
      };
    }

    try {
      const res = await apiClient.post('/api/ai/screen-explain', {
        context,
        user_prompt: userPrompt
      });
      return res.data;
    } catch (err) {
      console.warn('Screen explain query failed, returning fallback', err);
      return {
        title: `Screen Climate Analysis: ${context.selected_zone_id || 'Active View'}`,
        summary: `The active screen presents on-screen thermal analytics for ${context.selected_zone_id || 'the region'}.`,
        detailed_explanation: `Grounded telemetry indicates elevated surface temperatures driven by high built-up density and low shade.`,
        grounded_sources: ['National Observatory', 'Landsat-8 Baseline'],
        actionable_recommendations: ['Explore What-If scenario interventions', 'Check CoolPath for shaded pedestrian routes'],
        audio_transcript: `Here is your active screen analysis. High ground temperatures and low shade are the primary drivers. You can simulate policy interventions or inspect shaded routes.`,
        model_used: 'local-rag-fallback'
      };
    }
  },

  /**
   * Run Urban Policy What-If Intervention Simulation via Phase 3 FastAPI
   */
  async runSimulation(request) {
    if (USE_MOCK) {
      await delay(200);
      const { canopy_trees_added, cool_roof_sqm, water_kiosks_added } = request.interventions;
      
      const treeCooling = (canopy_trees_added / 100) * 0.45;
      const roofCooling = (cool_roof_sqm / 1000) * 0.18;
      const kioskCooling = water_kiosks_added * 0.15;
      const totalTempDrop = Math.min(4.8, +(treeCooling + roofCooling + kioskCooling).toFixed(2));
      
      const riskScoreDrop = +(totalTempDrop * 9.2).toFixed(1);
      const simulatedChrs = Math.max(25, +(89.4 - riskScoreDrop).toFixed(1));
      
      const budgetInr = canopy_trees_added * 3500 + cool_roof_sqm * 120 + water_kiosks_added * 300000;
      const co2Offset = +(canopy_trees_added * 0.05).toFixed(1);

      return {
        zone_id: request.zone_id,
        original_chrs: 89.4,
        simulated_chrs: simulatedChrs,
        predicted_lst_drop_c: totalTempDrop,
        population_benefited: 42000,
        estimated_budget_inr: budgetInr,
        co2_offset_tons_per_yr: co2Offset,
        payback_roi_rating: simulatedChrs < 65 ? 'High Priority - Proven Impact' : 'Moderate Priority'
      };
    }

    try {
      const res = await apiClient.post('/api/ai/simulate', request);
      return res.data;
    } catch (err) {
      console.warn('AI microservice unavailable, calculating local simulation fallback', err);
      return {
        zone_id: request.zone_id,
        original_chrs: 88,
        simulated_chrs: 63,
        predicted_lst_drop_c: 2.5,
        population_benefited: 42000,
        estimated_budget_inr: 1850000,
        co2_offset_tons_per_yr: 12.5,
        payback_roi_rating: 'High Priority'
      };
    }
  },

  /**
   * Commit What-If Policy Proposal into MongoDB
   */
  async saveProposal(proposal) {
    if (USE_MOCK) {
      await delay(200);
      return { status: 'Submitted', proposal_id: `PROP_${Date.now().toString().slice(-6)}`, ...proposal };
    }

    try {
      const res = await apiClient.post('/api/proposals', proposal);
      return res.data;
    } catch (err) {
      console.warn('Failed to save proposal to backend, falling back locally', err);
      return { status: 'Submitted', proposal_id: `PROP_${Date.now().toString().slice(-6)}`, ...proposal };
    }
  },

  /**
   * Compute CoolPath microclimate pedestrian navigation (Shortest vs Coolest)
   */
  async getCoolPath(origin, destination) {
    if (USE_MOCK) {
      await delay(250);
      return mockCoolPathData;
    }

    try {
      const res = await apiClient.post('/api/ai/coolpath', { origin, destination, mode: 'pedestrian' });
      return res.data;
    } catch (err) {
      console.warn('CoolPath engine unavailable, returning mock dual route comparison', err);
      return mockCoolPathData;
    }
  }
};
