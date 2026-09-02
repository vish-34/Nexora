/**
 * Generic focus and hysteresis thresholds per hierarchy level.
 * Hysteresis rule: enterZoom > exitZoom to prevent rapid switching near boundaries.
 */
export const defaultLevelConfig = {
  world: {
    enterZoom: 0.0,
    exitZoom: 0.0,
    cameraDistance: 140,
    transitionDuration: 1.2
  },
  country: {
    enterZoom: 0.32,
    exitZoom: 0.22,
    cameraDistance: 65,
    transitionDuration: 1.2
  },
  state: {
    enterZoom: 0.52,
    exitZoom: 0.42,
    cameraDistance: 28,
    transitionDuration: 1.1
  },
  district: {
    enterZoom: 0.68,
    exitZoom: 0.58,
    cameraDistance: 12,
    transitionDuration: 1.0
  },
  city: {
    enterZoom: 0.74,
    exitZoom: 0.64,
    cameraDistance: 7.5,
    transitionDuration: 1.0
  },
  neighborhood: {
    enterZoom: 0.86,
    exitZoom: 0.76,
    cameraDistance: 2.8,
    transitionDuration: 0.9
  },
  microgrid: {
    enterZoom: 0.93,
    exitZoom: 0.85,
    cameraDistance: 1.2,
    transitionDuration: 0.8
  }
};
