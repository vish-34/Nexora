export const mockHeatGrid = {
  type: "FeatureCollection",
  city: "Mumbai",
  description: "500m micro-grid polygon cells with satellite LST, vegetation NDVI, built-up NDBI, and CHRS heat risk",
  features: [
    {
      type: "Feature",
      id: "GRID_MUM_001",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8520, 19.0400],
            [72.8570, 19.0400],
            [72.8570, 19.0450],
            [72.8520, 19.0450],
            [72.8520, 19.0400]
          ]
        ]
      },
      properties: {
        zone_id: "GRID_MUM_001",
        name: "Dharavi Sector 3 / Transit Camp",
        ward: "G/North",
        lst_celsius: 43.8,
        ndvi: 0.08,
        ndbi: 0.78,
        population_density_per_sqkm: 68000,
        elderly_percentage: 14.5,
        informal_housing_ratio: 0.82,
        canopy_cover_pct: 3.5,
        drinking_water_access_score: 3.2,
        chrs_risk_score: 89.4,
        risk_level: "Critical",
        primary_hazard_driver: "Extreme low albedo sheet-roofing & severe vegetation deficit"
      }
    },
    {
      type: "Feature",
      id: "GRID_MUM_002",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8700, 19.0650],
            [72.8750, 19.0650],
            [72.8750, 19.0700],
            [72.8700, 19.0700],
            [72.8700, 19.0650]
          ]
        ]
      },
      properties: {
        zone_id: "GRID_MUM_002",
        name: "Kurla West Station Hub & Bus Depot",
        ward: "L Ward",
        lst_celsius: 42.1,
        ndvi: 0.12,
        ndbi: 0.74,
        population_density_per_sqkm: 54000,
        elderly_percentage: 16.2,
        informal_housing_ratio: 0.65,
        canopy_cover_pct: 5.2,
        drinking_water_access_score: 4.5,
        chrs_risk_score: 82.7,
        risk_level: "Critical",
        primary_hazard_driver: "Asphalt radiation from transit junctions & pedestrian congestion"
      }
    },
    {
      type: "Feature",
      id: "GRID_MUM_003",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8600, 19.0600],
            [72.8680, 19.0600],
            [72.8680, 19.0660],
            [72.8600, 19.0660],
            [72.8600, 19.0600]
          ]
        ]
      },
      properties: {
        zone_id: "GRID_MUM_003",
        name: "Bandra Kurla Complex (BKC) G-Block",
        ward: "H/East",
        lst_celsius: 39.5,
        ndvi: 0.28,
        ndbi: 0.62,
        population_density_per_sqkm: 18000,
        elderly_percentage: 9.1,
        informal_housing_ratio: 0.05,
        canopy_cover_pct: 18.0,
        drinking_water_access_score: 8.8,
        chrs_risk_score: 52.3,
        risk_level: "Moderate",
        primary_hazard_driver: "Glass facade reflection countered by landscaped corridors"
      }
    },
    {
      type: "Feature",
      id: "GRID_MUM_004",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8250, 19.0550],
            [72.8330, 19.0550],
            [72.8330, 19.0620],
            [72.8250, 19.0620],
            [72.8250, 19.0550]
          ]
        ]
      },
      properties: {
        zone_id: "GRID_MUM_004",
        name: "Bandra West / Carter Road Coastal Fringe",
        ward: "H/West",
        lst_celsius: 33.2,
        ndvi: 0.45,
        ndbi: 0.38,
        population_density_per_sqkm: 24000,
        elderly_percentage: 18.0,
        informal_housing_ratio: 0.12,
        canopy_cover_pct: 32.5,
        drinking_water_access_score: 9.1,
        chrs_risk_score: 31.0,
        risk_level: "Low",
        primary_hazard_driver: "Marine sea breeze buffering and dense mature tree canopy"
      }
    },
    {
      type: "Feature",
      id: "GRID_MUM_005",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.9250, 19.0450],
            [72.9330, 19.0450],
            [72.9330, 19.0520],
            [72.9250, 19.0520],
            [72.9250, 19.0450]
          ]
        ]
      },
      properties: {
        zone_id: "GRID_MUM_005",
        name: "Govandi - Mankhurd Slum Cluster",
        ward: "M/East",
        lst_celsius: 44.2,
        ndvi: 0.05,
        ndbi: 0.81,
        population_density_per_sqkm: 72000,
        elderly_percentage: 13.8,
        informal_housing_ratio: 0.89,
        canopy_cover_pct: 2.1,
        drinking_water_access_score: 2.7,
        chrs_risk_score: 93.6,
        risk_level: "Critical",
        primary_hazard_driver: "High informal tin-roof density, zero canopy, near Deonar proximity"
      }
    }
  ]
};

export const mockCoolingCenters = [
  {
    id: "SHELTER_01",
    name: "Dharavi Municipal Community AC Hall & Health Post",
    category: "Emergency Cooling Shelter",
    ward: "G/North",
    location: { lat: 19.0425, lng: 72.8545 },
    address: "60 Feet Road, Near Kamraj Memorial High School, Dharavi, Mumbai",
    operating_hours: "08:00 - 20:00 (Extended during Red Alerts)",
    capacity: 180,
    current_occupancy: 64,
    amenities: ["Air Conditioning", "Free Chilled ORS & Water", "Basic First Aid", "Doctor on Duty", "Phone Charging"],
    contact: "+91 22 2407 1234",
    status: "Open",
    verified: true,
    distance_meters: 350
  },
  {
    id: "SHELTER_02",
    name: "Kurla West Railway Station Hydration Kiosk & Misting Zone",
    category: "Hydration Station & Misting Booth",
    ward: "L Ward",
    location: { lat: 19.0665, lng: 72.8722 },
    address: "Platform 1 West Exit, Near Auto Stand, Kurla, Mumbai",
    operating_hours: "24/7",
    capacity: 45,
    current_occupancy: 18,
    amenities: ["High-Pressure Misting Fans", "Filtered Cold Water Dispenser", "Electrolyte Packs"],
    contact: "+91 22 2650 9988",
    status: "Open",
    verified: true,
    distance_meters: 620
  },
  {
    id: "SHELTER_03",
    name: "BKC Urban Green Oasis & Shaded Amphitheatre",
    category: "Public Shaded Canopy Zone",
    ward: "H/East",
    location: { lat: 19.0630, lng: 72.8640 },
    address: "Jio Garden Peripheral Shaded Walkway, Bandra Kurla Complex",
    operating_hours: "06:00 - 22:00",
    capacity: 300,
    current_occupancy: 82,
    amenities: ["Dense Tree Canopy", "Water Fountains", "Solar Charging Benches", "Restrooms"],
    contact: "+91 22 2659 4000",
    status: "Open",
    verified: true,
    distance_meters: 1200
  },
  {
    id: "SHELTER_04",
    name: "Govandi Maternity & Heatstroke Triage Hospital",
    category: "Medical Heat Clinic",
    ward: "M/East",
    location: { lat: 19.0490, lng: 72.9295 },
    address: "Station Road, Govandi East, Mumbai",
    operating_hours: "24/7 Emergency",
    capacity: 90,
    current_occupancy: 52,
    amenities: ["IV Saline Cold Baths", "ICU Heatstroke Beds", "Free Ice Packs", "ORS Packets"],
    contact: "+91 22 2555 3321",
    status: "Open",
    verified: true,
    distance_meters: 2100
  }
];

export const mockReports = [
  {
    id: "REP_001",
    reporter_name: "Ramesh Patil",
    phone: "+91 98201 XXXXX",
    category: "Hydration Crisis",
    description: "Public drinking water tap at transit camp crossroad has no water for 24 hours. Construction workers and street vendors having heat dizziness.",
    location: { lat: 19.0430, lng: 72.8550 },
    zone_id: "GRID_MUM_001",
    urgency: "Emergency",
    status: "In-Progress",
    ai_triage: {
      confidence: 0.96,
      extracted_entities: ["no drinking water", "heat dizziness", "workers"],
      recommended_action: "Dispatch emergency water tanker & ORS distribution kit"
    },
    created_at: "2026-09-02T09:15:00Z"
  },
  {
    id: "REP_002",
    reporter_name: "Dr. Sunita Rao",
    phone: "+91 98192 XXXXX",
    category: "Heat Exhaustion",
    description: "Elderly patient collapsed near platform 1 bus queue due to severe sun exposure and 42 degree surface heat.",
    location: { lat: 19.0670, lng: 72.8715 },
    zone_id: "GRID_MUM_002",
    urgency: "Critical",
    status: "Dispatched",
    ai_triage: {
      confidence: 0.98,
      extracted_entities: ["elderly collapsed", "sun exposure", "station bus queue"],
      recommended_action: "Send 108 ambulance and escort to Kurla Station Cooling Kiosk"
    },
    created_at: "2026-09-02T09:42:00Z"
  }
];

export const mockWeatherData = {
  city: "Mumbai",
  air_temp_c: 37.4,
  relative_humidity_pct: 74,
  wbgt_c: 33.8,
  heat_alert_level: "Red Alert - Extreme Danger",
  uv_index: 9.2,
  updated_at: new Date().toISOString()
};

export const mockXaiExplanation = {
  zone_id: "GRID_MUM_001",
  chrs_risk_score: 89.4,
  risk_category: "Critical",
  top_drivers: [
    { factor: "High Surface Temp (LST 43.8°C)", impact_pct: 36.2, status: "severe" },
    { factor: "Informal Tin Roof Density (82%)", impact_pct: 28.5, status: "severe" },
    { factor: "Severe Canopy Deficit (3.5% cover)", impact_pct: 22.1, status: "severe" },
    { factor: "Drinking Water Distance (750m avg)", impact_pct: 13.2, status: "warning" }
  ],
  sdg_alignment: ["SDG 11 - Sustainable Cities", "SDG 13 - Climate Action"]
};

export const mockCoolPathData = {
  shortest_route: {
    distance_meters: 1150,
    duration_minutes: 14,
    avg_exposure_temp_c: 43.1,
    shade_coverage_pct: 8.0,
    thermal_strain_index: "High Danger (91/100)",
    waypoints: [
      [72.8525, 19.0405],
      [72.8550, 19.0440],
      [72.8585, 19.0485]
    ]
  },
  coolest_route: {
    distance_meters: 1320,
    duration_minutes: 16,
    avg_exposure_temp_c: 38.6,
    shade_coverage_pct: 74.5,
    thermal_strain_index: "Safe / Tolerable (38/100)",
    water_points_enroute: 2,
    temp_relief_delta_c: -4.5,
    waypoints: [
      [72.8525, 19.0405],
      [72.8532, 19.0430],
      [72.8560, 19.0465],
      [72.8585, 19.0485]
    ]
  }
};
