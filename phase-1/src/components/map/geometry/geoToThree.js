import * as THREE from 'three';

// Global shared Web Mercator projection scale radius
// Using R = 100.0 ensures world width = 2 * PI * R ~ 628 units
export const PROJECTION_RADIUS = 100.0;

/**
 * Standard Web Mercator Projection (EPSG:3857)
 * Converts [longitude, latitude] into planar Three.js [x, y] coordinates.
 * Clamps latitude to [-85, 85] to prevent Mercator divergence at the poles.
 */
export function geoToThree(lng, lat) {
  const clampedLat = Math.max(-85.0511, Math.min(85.0511, lat));
  const x = (lng * Math.PI / 180.0) * PROJECTION_RADIUS;
  const latRad = clampedLat * Math.PI / 180.0;
  const y = Math.log(Math.tan(Math.PI / 4.0 + latRad / 2.0)) * PROJECTION_RADIUS;
  return new THREE.Vector2(x, y);
}

/**
 * Inverse Web Mercator Projection
 * Converts planar Three.js [x, y] back into geographic [longitude, latitude].
 */
export function threeToGeo(x, y) {
  const lng = (x / PROJECTION_RADIUS) * (180.0 / Math.PI);
  const latRad = 2.0 * Math.atan(Math.exp(y / PROJECTION_RADIUS)) - Math.PI / 2.0;
  const lat = latRad * (180.0 / Math.PI);
  return [lng, lat];
}

/**
 * Calculates both geographic bounds [minLng, minLat, maxLng, maxLat]
 * and projected Three.js bounds [minX, minY, maxX, maxY], along with centroids.
 */
export function calculateBoundsAndCentroid(geometry) {
  if (!geometry || !geometry.coordinates) {
    return {
      geoBounds: [-180, -85, 180, 85],
      geoCentroid: [0, 0],
      projectedBounds: { minX: -314.16, minY: -314.16, maxX: 314.16, maxY: 314.16, width: 628.32, height: 628.32 },
      projectedCentroid: { x: 0, y: 0 }
    };
  }

  let minLng = Infinity, minLat = Infinity;
  let maxLng = -Infinity, maxLat = -Infinity;
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  let totalLng = 0, totalLat = 0, ptCount = 0;

  function processPoint(lng, lat) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;

    const v = geoToThree(lng, lat);
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;

    totalLng += lng;
    totalLat += lat;
    ptCount++;
  }

  function walkCoords(coords) {
    if (typeof coords[0] === 'number') {
      processPoint(coords[0], coords[1]);
    } else {
      for (const item of coords) {
        walkCoords(item);
      }
    }
  }

  walkCoords(geometry.coordinates);

  const geoCentroid = ptCount > 0
    ? [totalLng / ptCount, totalLat / ptCount]
    : [(minLng + maxLng) / 2, (minLat + maxLat) / 2];

  const projectedCentroid = {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2
  };

  return {
    geoBounds: [minLng, minLat, maxLng, maxLat],
    geoCentroid,
    projectedBounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(0.0001, maxX - minX),
      height: Math.max(0.0001, maxY - minY)
    },
    projectedCentroid
  };
}

/**
 * Standard ray-casting point-in-polygon containment test.
 */
export function isPointInPolygon(point, ring) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Tests whether [lng, lat] is inside a GeoJSON geometry (Polygon or MultiPolygon),
 * properly honoring inner holes.
 */
export function isPointInsideGeometry(lng, lat, geometry) {
  if (!geometry || !geometry.coordinates) return false;
  const pt = [lng, lat];

  if (geometry.type === 'Polygon') {
    const outerRing = geometry.coordinates[0];
    if (!isPointInPolygon(pt, outerRing)) return false;
    // Check holes
    for (let i = 1; i < geometry.coordinates.length; i++) {
      if (isPointInPolygon(pt, geometry.coordinates[i])) {
        return false; // Point is inside a hole
      }
    }
    return true;
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) {
      if (isPointInPolygon(pt, poly[0])) {
        let inHole = false;
        for (let i = 1; i < poly.length; i++) {
          if (isPointInPolygon(pt, poly[i])) {
            inHole = true;
            break;
          }
        }
        if (!inHole) return true;
      }
    }
  }

  return false;
}
