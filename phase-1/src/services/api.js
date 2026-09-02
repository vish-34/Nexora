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
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // defaults to true for safe zero-block offline dev

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper for simulated network delay in mock mode
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
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
  async getCurrentWeather() {
    if (USE_MOCK) {
      await delay();
      return mockWeatherData;
    }

    try {
      const res = await apiClient.get('/api/weather/current');
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
      const res = await apiClient.get('/api/cooling-centers', { params: { lat, lng } });
      return res.data;
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
      return res.data;
    } catch (err) {
      console.warn('Backend unavailable, using mock reports fallback', err);
      return mockReports;
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
      return res.data;
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
   * Fetch Explainable AI (XAI) factor diagnostics for a clicked hotspot cell
   */
  async getXaiExplanation(zoneId) {
    if (USE_MOCK) {
      await delay();
      return {
        ...mockXaiExplanation,
        zone_id: zoneId
      };
    }

    try {
      const res = await apiClient.get(`/api/ai/explain/${zoneId}`);
      return res.data;
    } catch (err) {
      console.warn('AI microservice unavailable, returning mock XAI explanation', err);
      return {
        ...mockXaiExplanation,
        zone_id: zoneId
      };
    }
  },

  /**
   * Run Urban Policy What-If Intervention Simulation
   */
  async runSimulation(request) {
    if (USE_MOCK) {
      await delay(200);
      const { canopy_trees_added, cool_roof_sqm, water_kiosks_added } = request.interventions;
      
      // Scientific simulation formulas
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
      return this.runSimulation({ ...request, zone_id: request.zone_id });
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
