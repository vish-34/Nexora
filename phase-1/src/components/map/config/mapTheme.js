export const mapTheme = {
  background: '#132820',
  gridLines: 'rgba(255, 255, 255, 0.04)',

  colors: {
    world: '#1a3627',
    country: '#274e38',
    state: '#3b6e4e',
    city: '#4d7c43',
    neighborhood: '#5a7d4a',
    
    // Exact choropleth scale from reference image
    risk: {
      critical: '#dff279',  // Luminous Pale Lime (80-100)
      high: '#cbe06c',      // Warm Lime (65-79)
      moderate: '#8fae58',  // Olive Green (35-64)
      low: '#3b684b'        // Deep Forest Green (0-34)
    },

    activeHighlight: '#dff279',
    boundary: '#132820',
    boundaryHover: '#ffffff'
  },

  opacity: {
    active: 0.95,
    sibling: 0.25,
    ancestor: 0.40,
    hidden: 0.0
  }
};
