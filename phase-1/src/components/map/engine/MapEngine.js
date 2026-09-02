import * as THREE from 'three';
import { CameraController } from './CameraController.js';
import { RaycastManager } from './RaycastManager.js';
import { GeographicFocusDetector } from './GeographicFocusDetector.js';
import { FocusTransitionController } from './FocusTransitionController.js';
import { MapFocusManager } from './MapFocusManager.js';
import { BoundaryRenderer } from '../geometry/BoundaryRenderer.js';
import { RegionRegistry } from '../hierarchy/RegionRegistry.js';
import { GeographicHierarchy } from '../hierarchy/GeographicHierarchy.js';
import { RegionGeometryFactory } from '../geometry/RegionGeometryFactory.js';
import { mapTheme } from '../config/mapTheme.js';

// Real GeoJSON imports
import worldData from '../../../data/world.json';
import indiaStatesData from '../../../data/india-states.json';
import maharashtraDistrictsData from '../../../data/maharashtra-districts.json';
import allIndiaDistrictsData from '../../../data/all-india-other-districts.json';
import mumbaiNeighborhoodsData from '../../../data/mumbai-neighborhoods.json';
import mumbaiGridData from '../../../data/mumbai-grid.json';
import { getStateProfile } from '../../../data/indiaStateProfiles.js';

export class MapEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f8fafc');

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Camera & Controls (Orthographic camera with pan & focal zoom)
    this.cameraController = new CameraController(container);
    this.boundaryRenderer = new BoundaryRenderer(this.scene);

    // RaycastManager with active-region awareness
    this.raycastManager = new RaycastManager(
      this.cameraController.camera,
      container,
      () => this.focusManager?.currentRegion
    );

    // Hierarchy & Registries
    this.registry = new RegionRegistry();
    this.hierarchy = new GeographicHierarchy(this.registry);

    this.detector = new GeographicFocusDetector(this.registry, this.hierarchy);
    this.transitionController = new FocusTransitionController(
      this.cameraController,
      this.hierarchy,
      this.boundaryRenderer
    );

    this.focusManager = new MapFocusManager(
      this.registry,
      this.hierarchy,
      this.detector,
      this.transitionController,
      this.cameraController
    );

    this.allMeshes = [];
    this.initHierarchy();
    this.initRaycasting();

    // On initial load / refresh: Snap directly to INDIA with whole country visible
    this.initIndiaView();

    this.isRunning = true;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initHierarchy() {
    // 1. Ingest World Level (Countries like China, Pakistan, Brazil, USA)
    this.registry.ingestGeoJSON(worldData, 'world', 'country');

    // 2. Ingest Indian States Level (Parent: 'india')
    const stateRegions = this.registry.ingestGeoJSON(indiaStatesData, 'india', 'state');
    for (const state of stateRegions) {
      const profile = getStateProfile(state.id, state.name);
      state.properties.lst_celsius = profile.lst_celsius || 42.0;
      state.properties.wbgt_c = profile.wbgt_c || 33.0;
      state.properties.population_millions = profile.population_millions || 30.0;
      state.properties.heat_risk = profile.heat_risk || 'High';

      // Derived CHRS Risk Score
      let chrs = 65;
      const hr = (profile.heat_risk || '').toLowerCase();
      if (hr.includes('critical') || hr.includes('extreme')) chrs = 88;
      else if (hr.includes('severe')) chrs = 78;
      else if (hr.includes('high')) chrs = 68;
      else chrs = 52;
      state.properties.chrs_risk_score = chrs;

      // Derived Canopy Cover %
      let canopy = 15;
      const sid = state.id.toLowerCase();
      if (['kerala', 'goa', 'assam', 'meghalaya', 'sikkim', 'arunachal-pradesh', 'tripura', 'mizoram'].includes(sid)) canopy = 44;
      else if (['karnataka', 'tamil-nadu', 'odisha', 'west-bengal', 'uttarakhand', 'himachal-pradesh'].includes(sid)) canopy = 28;
      else if (['maharashtra', 'telangana', 'andhra-pradesh', 'madhya-pradesh', 'chhattisgarh'].includes(sid)) canopy = 16;
      else canopy = 6.5; // arid: rajasthan, gujarat, haryana, punjab, delhi
      state.properties.canopy_cover_pct = canopy;
    }

    // 3. Ingest Maharashtra Districts Level (Parent: 'maharashtra')
    const districtRegions = this.registry.ingestGeoJSON(maharashtraDistrictsData, 'maharashtra', 'city');
    for (const dist of districtRegions) {
      const id = dist.id.toLowerCase();
      if (id.includes('mumbai')) {
        dist.properties.lst_celsius = 44.1;
        dist.properties.chrs_risk_score = 86;
        dist.properties.canopy_cover_pct = 11.8;
      } else if (id.includes('nagpur') || id.includes('chandrapur') || id.includes('amravati')) {
        dist.properties.lst_celsius = 46.8;
        dist.properties.chrs_risk_score = 90;
        dist.properties.canopy_cover_pct = 8.5;
      } else if (id.includes('pune') || id.includes('satara') || id.includes('kolhapur')) {
        dist.properties.lst_celsius = 39.8;
        dist.properties.chrs_risk_score = 62;
        dist.properties.canopy_cover_pct = 24.0;
      } else if (id.includes('thane') || id.includes('palghar')) {
        dist.properties.lst_celsius = 42.5;
        dist.properties.chrs_risk_score = 74;
        dist.properties.canopy_cover_pct = 18.0;
      } else {
        dist.properties.lst_celsius = 43.5;
        dist.properties.chrs_risk_score = 75;
        dist.properties.canopy_cover_pct = 14.0;
      }
    }

    // 3b. Ingest Accurate District Polygons for All 35 Other States & UTs (e.g. Rajasthan, Gujarat, Karnataka, Tamil Nadu, UP, MP, etc.)
    const otherDistrictRegions = this.registry.ingestGeoJSON(allIndiaDistrictsData, 'india', 'city');
    for (const dist of otherDistrictRegions) {
      const parentState = this.registry.get(dist.parentId);
      const stateProps = parentState?.properties || {};
      const baseLST = stateProps.lst_celsius || 42.0;
      const baseCHRS = stateProps.chrs_risk_score || 68;
      const baseCanopy = stateProps.canopy_cover_pct || 14.0;

      // Deterministic spatial microclimate distribution
      let hash = 0;
      for (let i = 0; i < dist.id.length; i++) {
        hash = (hash * 31 + dist.id.charCodeAt(i)) % 1000;
      }
      const deltaLST = ((hash % 10) - 5) * 0.35;
      const deltaCHRS = (hash % 15) - 7;
      const deltaCanopy = ((hash % 9) - 4) * 0.8;

      dist.properties.lst_celsius = +(baseLST + deltaLST).toFixed(1);
      dist.properties.wbgt_c = +(31.5 + ((hash % 8) * 0.3)).toFixed(1);
      dist.properties.population_millions = +(1.2 + ((hash % 20) * 0.25)).toFixed(1);
      dist.properties.chrs_risk_score = Math.min(96, Math.max(35, baseCHRS + deltaCHRS));
      dist.properties.canopy_cover_pct = Math.max(2.0, +(baseCanopy + deltaCanopy).toFixed(1));
      dist.properties.capital = dist.name + ' District HQ';
      dist.properties.heat_risk = dist.properties.chrs_risk_score >= 82 ? 'Critical Urban Heat' : (dist.properties.chrs_risk_score >= 70 ? 'High Vulnerability' : 'Moderate Heat');
      dist.properties.primary_hazard = `Microclimate heat pocket in ${dist.name} with ${dist.properties.lst_celsius}°C surface temperatures and localized moisture disparity`;
    }

    // 4. Ingest Mumbai Wards Level (Parent: 'mumbai')
    const wardRegions = this.registry.ingestGeoJSON(mumbaiNeighborhoodsData, 'mumbai', 'neighborhood');
    for (const ward of wardRegions) {
      const id = ward.id.toLowerCase();
      if (id.includes('dharavi')) {
        ward.properties.lst_celsius = 45.8;
        ward.properties.chrs_risk_score = 89;
        ward.properties.canopy_cover_pct = 3.2;
      } else if (id.includes('kurla') || id.includes('govandi')) {
        ward.properties.lst_celsius = 44.6;
        ward.properties.chrs_risk_score = 85;
        ward.properties.canopy_cover_pct = 4.8;
      } else if (id.includes('bandra') || id.includes('juhu')) {
        ward.properties.lst_celsius = 39.5;
        ward.properties.chrs_risk_score = 56;
        ward.properties.canopy_cover_pct = 19.5;
      } else if (id.includes('bkc') || id.includes('andheri')) {
        ward.properties.lst_celsius = 43.0;
        ward.properties.chrs_risk_score = 76;
        ward.properties.canopy_cover_pct = 8.0;
      } else {
        ward.properties.lst_celsius = 41.5;
        ward.properties.chrs_risk_score = 68;
        ward.properties.canopy_cover_pct = 12.0;
      }
    }

    // 5. Ingest Mumbai 500m Micro-Grids (Parent: respective neighborhood)
    this.registry.ingestGeoJSON(mumbaiGridData, 'mumbai-dharavi', 'microgrid');

    // Build Three.js Geometry for all registered regions
    const allRegions = this.registry.getAll();

    for (const region of allRegions) {
      if (region.level === 'world') continue;

      let color = region.properties.color || mapTheme.colors[region.level] || '#e2e8f0';

      // Initial opacity configured for India as active focus
      let initialOpacity = 0.0;
      if (region.id === 'india') initialOpacity = 0.95;
      else if (region.parentId === 'india') initialOpacity = 0.90; // Indian states visible in clean silver
      else if (region.level === 'country') initialOpacity = 0.35; // Surrounding world countries

      const meshGroup = RegionGeometryFactory.createRegionMesh(region, color, initialOpacity);

      if (meshGroup) {
        this.scene.add(meshGroup);
        this.allMeshes.push(meshGroup);
      }
    }

    // Default clean silver-white map on refresh (no filters active)
    this.activeLayer = null;
  }

  /**
   * On refresh / start: Snap camera to India with full country visible, clean default green
   */
  initIndiaView() {
    const indiaRegion = this.registry.get('india');
    if (indiaRegion) {
      const framing = this.cameraController.fitBounds(indiaRegion.projectedBounds, 1.20);
      this.cameraController.camera.position.set(framing.position.x, framing.position.y, framing.position.z);
      this.cameraController.controls.target.set(framing.target.x, framing.target.y, framing.target.z);
      this.cameraController.camera.zoom = framing.zoom;
      this.cameraController.camera.updateProjectionMatrix();

      this.focusManager.setCurrentRegion(indiaRegion, true);
      this.transitionController.updateVisibility(indiaRegion, 0);
      // No pin/boundary highlighted on initial refresh
      this.boundaryRenderer.setHighlight(null);
    }
  }

  /**
   * Raycasting: Clicking ANY region (India, Gujarat, Rajasthan, Maharashtra, etc.)
   * immediately triggers programmatic focus and framing on that region!
   */
  initRaycasting() {
    this.raycastManager.setInteractiveMeshes(this.allMeshes);

    this.raycastManager.on('click', (region) => {
      if (region) {
        this.focusRegion(region.id, { animateZoom: true, force: true });
        if (this.options.onSelectRegion) {
          this.options.onSelectRegion(region);
        }
      }
    });
  }

  focusRegion(regionId, options = { animateZoom: true, force: true }) {
    this.focusManager.focusRegion(regionId, { ...options, force: true });
  }

  zoomIn() {
    this.cameraController.zoomBy(1.35);
  }

  zoomOut() {
    this.cameraController.zoomBy(1 / 1.35);
  }

  resetView() {
    this.focusRegion('india', { animateZoom: true, force: true });
  }

  /**
   * Screen 1: Dynamic Multi-Tier Map Layer Switcher
   * Dynamically transforms colors across all levels: India, States, Districts, Wards, Microgrids
   */
  setMapLayer(layerName = 'chrs') {
    this.activeLayer = layerName;

    for (const group of this.allMeshes) {
      const region = group.userData?.region;
      if (!region) continue;

      let colorHex = '#e2e8f0';

      // 0. DEFAULT CLEAN SILVERY WHITE (Matching Reference Image)
      if (!layerName || layerName === 'default') {
        colorHex = region.properties?.color || mapTheme.colors[region.level] || '#e2e8f0';
      }
      // 1. HEAT RISK LAYER (CHRS 0-100)
      else if (layerName === 'chrs') {
        const score = region.properties?.chrs_risk_score ?? 60;
        if (score >= 82) colorHex = '#ef4444'; // Critical Hotspot (Vibrant Red)
        else if (score >= 74) colorHex = '#f97316'; // Severe Heat (Warm Orange)
        else if (score >= 62) colorHex = '#f59e0b'; // High Heat (Warm Amber)
        else if (score >= 50) colorHex = '#84cc16'; // Moderate (Lime Green)
        else colorHex = '#22c55e'; // Low / Safe (Green)
      }
      // 2. SURFACE TEMP LAYER (LST °C)
      else if (layerName === 'lst') {
        const lst = region.properties?.lst_celsius ?? 41.0;
        if (lst >= 46.0) colorHex = '#dc2626'; // Extreme 46°C+ (Deep Crimson)
        else if (lst >= 44.0) colorHex = '#ea580c'; // 44-46°C (Fiery Red-Orange)
        else if (lst >= 41.5) colorHex = '#f59e0b'; // 41.5-44°C (Bright Amber)
        else if (lst >= 38.5) colorHex = '#eab308'; // 38.5-41.5°C (Warm Gold)
        else colorHex = '#94a3b8'; // < 38.5°C (Cool Slate)
      }
      // 3. VEGETATION LAYER (NDVI Canopy %)
      else if (layerName === 'ndvi') {
        const canopy = region.properties?.canopy_cover_pct ?? 12.0;
        if (canopy >= 35.0) colorHex = '#15803d'; // > 35% Rainforest / Lush Green
        else if (canopy >= 22.0) colorHex = '#22c55e'; // 22-35% Rich Forest
        else if (canopy >= 14.0) colorHex = '#84cc16'; // 14-22% Fresh Leaf Green
        else if (canopy >= 7.0) colorHex = '#d97706'; // 7-14% Semi-Arid Khaki
        else colorHex = '#cbd5e1'; // < 7% Arid Sand
      }

      // Update color on all mesh children
      group.traverse((child) => {
        if (child.isMesh && child.material && child.material.color) {
          child.material.color.set(colorHex);
        }
      });
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.cameraController.update();
    this.focusManager.update();
    this.renderer.render(this.scene, this.cameraController.camera);

    requestAnimationFrame(this.animate);
  }

  dispose() {
    this.isRunning = false;
    this.cameraController.dispose();
    this.raycastManager.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
