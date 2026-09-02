import { threeToGeo, isPointInsideGeometry } from '../geometry/geoToThree.js';

export class GeographicFocusDetector {
  constructor(registry, hierarchy) {
    this.registry = registry;
    this.hierarchy = hierarchy;
    this.currentRegion = null;
  }

  setCurrentRegion(region) {
    this.currentRegion = region;
  }

  /**
   * Direction-Aware Hierarchical Focus Detector
   *
   * Rules:
   * 1. When direction === "OUT":
   *    DO NOT search geographic candidates.
   *    If currentRegion has crossed exit threshold, return currentRegion.parent.
   *    Never select a sibling or random polygon!
   *
   * 2. When direction === "IN":
   *    Only search children of currentRegion.
   *    Never jump sideways to a sibling!
   *
   * @param {Object} params - { target, currentZoom, currentRegion, direction }
   * @returns {GeographicRegion}
   */
  detect({ target, currentZoom, currentRegion, direction }) {
    const active = currentRegion || this.currentRegion || this.registry.get('india') || this.registry.root;

    // =========================================================================
    // ZOOM OUT: STRICT ASCENT (Parent only, zero candidate search)
    // =========================================================================
    if (direction === 'OUT') {
      if (active && active.parentId) {
        const exitThreshold = active.focusConfig?.exitZoom ?? 0.65;
        if (currentZoom < exitThreshold) {
          const parent = this.registry.get(active.parentId);
          if (parent) {
            return parent;
          }
        }
      }
      return active;
    }

    // =========================================================================
    // ZOOM IN: STRICT DESCENT (Children of active region only)
    // =========================================================================
    if (direction === 'IN') {
      if (!target || typeof target.x !== 'number') {
        return active;
      }

      const children = active.children || [];
      if (children.length === 0) {
        return active;
      }

      const [lng, lat] = threeToGeo(target.x, target.y);

      for (const child of children) {
        // In auto-detection, ignore foreign countries if active is world
        if (active.level === 'world' && child.id !== 'india') continue;

        // Bounding box filter
        if (!child.isPointInBounds(lng, lat)) continue;

        // Polygon containment
        if (isPointInsideGeometry(lng, lat, child.geometry)) {
          const enterThreshold = child.focusConfig?.enterZoom ?? 1.0;
          if (currentZoom >= enterThreshold) {
            return child;
          }
        }
      }

      return active;
    }

    // =========================================================================
    // IDLE / NONE: Check exit threshold fallback or retain active
    // =========================================================================
    if (active && active.parentId) {
      const exitThreshold = active.focusConfig?.exitZoom ?? 0.65;
      if (currentZoom < exitThreshold) {
        const parent = this.registry.get(active.parentId);
        if (parent) return parent;
      }
    }

    return active;
  }
}
