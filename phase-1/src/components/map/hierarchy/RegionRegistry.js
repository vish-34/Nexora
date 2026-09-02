import { GeographicRegion } from './GeographicRegion.js';
import { calculateBoundsAndCentroid } from '../geometry/geoToThree.js';

// Tuned, responsive zoom thresholds with instant 80% comfortable framing exit points
export const LEVEL_ZOOM_THRESHOLDS = {
  world: { fitZoom: 0.35, enterZoom: 0.05, exitZoom: 0.0 },
  country: { fitZoom: 1.83, enterZoom: 1.0, exitZoom: 1.45 },
  state: { fitZoom: 7.5, enterZoom: 4.2, exitZoom: 6.0 },
  district: { fitZoom: 25.0, enterZoom: 12.0, exitZoom: 20.0 },
  city: { fitZoom: 40.0, enterZoom: 14.0, exitZoom: 32.0 },
  neighborhood: { fitZoom: 120.0, enterZoom: 45.0, exitZoom: 96.0 },
  microgrid: { fitZoom: 400.0, enterZoom: 120.0, exitZoom: 320.0 }
};

export class RegionRegistry {
  constructor() {
    this.regions = new Map();
    this.root = null;
    this.initRoot();
  }

  initRoot() {
    this.root = new GeographicRegion({
      id: 'world',
      name: 'World',
      level: 'world',
      parentId: null,
      geoBounds: [-180, -85, 180, 85],
      geoCentroid: [0, 20],
      projectedBounds: {
        minX: -314.16,
        minY: -160.0,
        maxX: 314.16,
        maxY: 200.0,
        width: 628.32,
        height: 360.0
      },
      projectedCentroid: { x: 0, y: 20 },
      focusConfig: {
        fitZoom: 0.35,
        enterZoom: 0.05,
        exitZoom: 0.0,
        transitionDuration: 0.5
      }
    });
    this.register(this.root);
  }

  register(region) {
    this.regions.set(region.id, region);
    if (region.name) {
      const normalizedName = region.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (!this.regions.has(normalizedName)) {
        this.regions.set(normalizedName, region);
      }
    }
  }

  get(id) {
    if (!id) return null;
    return this.regions.get(id) || this.regions.get(id.toLowerCase().replace(/[^a-z0-9]+/g, '-')) || null;
  }

  getAll() {
    return Array.from(new Set(this.regions.values()));
  }

  ingestGeoJSON(featureCollection, parentId = 'world', level = 'country') {
    if (!featureCollection || !featureCollection.features) return [];

    const createdRegions = [];
    const parent = this.get(parentId);
    const defaults = LEVEL_ZOOM_THRESHOLDS[level] || LEVEL_ZOOM_THRESHOLDS.country;

    for (const feature of featureCollection.features) {
      const props = feature.properties || {};
      const rawName = props.name || feature.id || 'Region';
      const id = (props.id || feature.id || rawName).toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { geoBounds, geoCentroid, projectedBounds, projectedCentroid } =
        calculateBoundsAndCentroid(feature.geometry);

      const aspect = 1.5;
      const frustumSize = 120;
      const zoomX = (frustumSize * aspect) / (projectedBounds.width * 1.25);
      const zoomY = frustumSize / (projectedBounds.height * 1.25);
      const calculatedFit = Math.min(zoomX, zoomY);

      const fitZoom = defaults.fitZoom || calculatedFit;
      // Enter threshold when zooming in:
      const enterZoom = defaults.enterZoom || (fitZoom * 0.60);
      // Data-driven exit threshold: immediate exit when region shrinks to ~80% of comfortable framing
      const exitZoom = defaults.exitZoom || (fitZoom * 0.80);

      const effectiveParentId = props.parentId || parentId;

      const region = new GeographicRegion({
        id,
        name: rawName,
        level: props.level || level,
        parentId: effectiveParentId,
        geometry: feature.geometry,
        geoBounds,
        geoCentroid,
        projectedBounds,
        projectedCentroid,
        properties: props,
        focusConfig: {
          fitZoom,
          enterZoom,
          exitZoom,
          transitionDuration: 0.45
        }
      });

      this.register(region);
      createdRegions.push(region);

      const parentObj = this.get(effectiveParentId);
      if (parentObj) {
        parentObj.addChild(region);
      }
    }

    return createdRegions;
  }
}
