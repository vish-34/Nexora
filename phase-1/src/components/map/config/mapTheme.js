export const mapTheme = {
  background: '#f8fafc',
  gridLines: 'rgba(0, 0, 0, 0.04)',

  colors: {
    world: '#f1f5f9',
    country: '#e2e8f0',
    state: '#e2e8f0',
    city: '#cbd5e1',
    neighborhood: '#cbd5e1',
    
    // Light Theme Choropleth Scales
    risk: {
      critical: '#ef4444',  // Vibrant Coral Red
      high: '#f97316',      // Warm Orange
      moderate: '#f59e0b',  // Amber
      low: '#22c55e'        // Fresh Green
    },

    activeHighlight: '#0f172a',
    boundary: '#ffffff',
    boundaryHover: '#0f172a'
  },

  opacity: {
    active: 0.95,
    sibling: 0.85,
    ancestor: 0.40,
    hidden: 0.0
  }
};
