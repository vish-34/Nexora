export class GeographicRegion {
  constructor(config = {}) {
    this.id = config.id || '';
    this.name = config.name || '';
    this.level = config.level || 'country';
    this.parentId = config.parentId || null;
    this.geometry = config.geometry || null;

    this.geoBounds = config.geoBounds || [-180, -85, 180, 85];
    this.geoCentroid = config.geoCentroid || [0, 0];
    this.projectedBounds = config.projectedBounds || { minX: -314, minY: -314, maxX: 314, maxY: 314, width: 628, height: 628 };
    this.projectedCentroid = config.projectedCentroid || { x: 0, y: 0 };

    this.children = [];
    this.properties = config.properties || {};

    // Dynamic focus configuration derived from projected bounds
    this.focusConfig = Object.assign(
      {
        transitionDuration: 1.1,
        // Zoom thresholds (calculated or overridden)
        fitZoom: config.focusConfig?.fitZoom || 1.0,
        enterZoom: config.focusConfig?.enterZoom || 0.6,
        exitZoom: config.focusConfig?.exitZoom || 0.4
      },
      config.focusConfig || {}
    );

    this.mesh = null;
    this.boundaryMesh = null;
  }

  addChild(childRegion) {
    childRegion.parentId = this.id;
    this.children.push(childRegion);
  }

  isPointInBounds(lng, lat) {
    if (!this.geoBounds) return true;
    const [minLng, minLat, maxLng, maxLat] = this.geoBounds;
    return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
  }
}
