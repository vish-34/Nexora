export const indiaStateProfiles = {
  // National & Global Tiers
  india: {
    name: 'India',
    level: 'country',
    capital: 'New Delhi',
    region: 'South Asian Subcontinent',
    lst_celsius: 43.2,
    wbgt_c: 33.5,
    population_millions: 1428.0,
    heat_risk: 'Critical Subcontinental',
    hap_status: 'NDMA National Framework (23 States Active)',
    primary_hazard: 'Seasonal heatwaves (Loo winds in North-West & severe wet-bulb humidity on coasts)'
  },
  world: {
    name: 'World',
    level: 'world',
    capital: 'Global Index',
    region: 'Planetary Climate System',
    lst_celsius: 31.4,
    wbgt_c: 28.2,
    population_millions: 8050.0,
    heat_risk: 'Planetary Heat Alert',
    hap_status: 'WMO Early Warnings for All Initiative',
    primary_hazard: 'Rising global surface temperatures and escalating compound terrestrial heatwaves'
  },
  mumbai: {
    name: 'Mumbai',
    level: 'city',
    capital: 'Fort / BMC HQ',
    region: 'Konkan Coast Urban Conurbation',
    lst_celsius: 44.1,
    wbgt_c: 34.2,
    population_millions: 21.3,
    heat_risk: 'Extreme Coastal Humidity',
    hap_status: 'Mumbai Climate Action Plan (MCAP) Heat Cell',
    primary_hazard: 'Severe micro-climate disparity between coastal mangroves and dense informal tin-roof settlements'
  },
  'mumbai-dharavi': {
    name: 'Dharavi',
    level: 'neighborhood',
    capital: 'Ward G/North',
    region: 'Central Mumbai Dense Cluster',
    lst_celsius: 45.8,
    wbgt_c: 35.1,
    population_millions: 0.85,
    heat_risk: 'Critical Micro-Heat Trap',
    hap_status: 'Cool Roofs & Shaded Walkway Pilot Active',
    primary_hazard: '92% tin & corrugated metal roofing density with < 3.2% tree canopy cover creating intense heat retention'
  },

  // States & UTs
  maharashtra: {
    name: 'Maharashtra',
    level: 'state',
    capital: 'Mumbai',
    region: 'Western Deccan & Konkan Coast',
    lst_celsius: 43.8,
    wbgt_c: 33.8,
    population_millions: 126.4,
    heat_risk: 'Critical',
    hap_status: 'Active Municipal Heat Action Plan',
    primary_hazard: 'High informal sheet-roof density in coastal Mumbai & severe inland Vidarbha heatwaves'
  },
  gujarat: {
    name: 'Gujarat',
    level: 'state',
    capital: 'Gandhinagar / Ahmedabad',
    region: 'Western Arid & Kathiawar Coast',
    lst_celsius: 45.2,
    wbgt_c: 34.5,
    population_millions: 70.4,
    heat_risk: 'Severe',
    hap_status: 'Pioneer Ahmedabad Heat Action Plan (HAP)',
    primary_hazard: 'Extreme surface temperatures in Kutch, Ahmedabad urban heat islands, and industrial zones'
  },
  rajasthan: {
    name: 'Rajasthan',
    level: 'state',
    capital: 'Jaipur',
    region: 'Thar Desert & Semi-Arid Plains',
    lst_celsius: 47.1,
    wbgt_c: 32.1,
    population_millions: 81.0,
    heat_risk: 'Extreme Arid',
    hap_status: 'State Desert Heatwave Protocol',
    primary_hazard: 'Intense dry desert winds (Loo), daytime solar radiation > 47°C, and water scarcity'
  },
  delhi: {
    name: 'Delhi NCR',
    level: 'state',
    capital: 'New Delhi',
    region: 'Northern Urban Megacity',
    lst_celsius: 46.5,
    wbgt_c: 33.9,
    population_millions: 33.0,
    heat_risk: 'Extreme Urban Heat Island',
    hap_status: 'Delhi Heat Wave Action Plan 2024',
    primary_hazard: 'Massive asphalt & concrete built-up density, night-time heat trapping, vehicular emissions'
  },
  karnataka: {
    name: 'Karnataka',
    level: 'state',
    capital: 'Bengaluru',
    region: 'Southern Deccan Plateau & Malabar Coast',
    lst_celsius: 38.5,
    wbgt_c: 29.8,
    population_millions: 68.2,
    heat_risk: 'Elevated Moderate',
    hap_status: 'State Climate Action Plan',
    primary_hazard: 'Rapid loss of urban tree canopy, lake catchment depletion, and Kalaburagi northern heatwaves'
  },
  'uttar-pradesh': {
    name: 'Uttar Pradesh',
    level: 'state',
    capital: 'Lucknow',
    region: 'Indo-Gangetic Plain',
    lst_celsius: 45.8,
    wbgt_c: 34.1,
    population_millions: 241.0,
    heat_risk: 'Severe Regional',
    hap_status: 'UP State Disaster Management Plan',
    primary_hazard: 'Extreme population exposure in rural brick kilns and high humidity along the Ganges basin'
  },
  'tamil-nadu': {
    name: 'Tamil Nadu',
    level: 'state',
    capital: 'Chennai',
    region: 'Coromandel Coast & Southern Plains',
    lst_celsius: 41.2,
    wbgt_c: 33.6,
    population_millions: 76.8,
    heat_risk: 'High Coastal Wet-Bulb',
    hap_status: 'Tamil Nadu Heat Mitigation Strategy',
    primary_hazard: 'High relative humidity combined with elevated summer temperatures creating dangerous heat indices'
  },
  telangana: {
    name: 'Telangana',
    level: 'state',
    capital: 'Hyderabad',
    region: 'Central Semi-Arid Plateau',
    lst_celsius: 44.6,
    wbgt_c: 32.8,
    population_millions: 38.0,
    heat_risk: 'Severe',
    hap_status: 'Telangana Cool Roof Policy 2023-2028',
    primary_hazard: 'Granite bedrock heat reradiation, Hyderabad expansion, and Ramagundam thermal corridor'
  },
  'andhra-pradesh': {
    name: 'Andhra Pradesh',
    level: 'state',
    capital: 'Amaravati',
    region: 'Coastal Andhra & Rayalaseema',
    lst_celsius: 45.0,
    wbgt_c: 34.4,
    population_millions: 53.0,
    heat_risk: 'Severe Combined',
    hap_status: 'State Disaster Early Warning Network',
    primary_hazard: 'Rayalaseema dry heat combined with coastal humid heatwaves in Vijayawada & Visakhapatnam'
  },
  'west-bengal': {
    name: 'West Bengal',
    level: 'state',
    capital: 'Kolkata',
    region: 'Bengal Delta & Coastal Plain',
    lst_celsius: 42.4,
    wbgt_c: 35.2,
    population_millions: 99.0,
    heat_risk: 'Critical Wet-Bulb',
    hap_status: 'Kolkata Heat Resilience Initiative',
    primary_hazard: 'Extreme tropical humidity exceeding 75% alongside 40°C temperatures causing life-threatening wet-bulb stress'
  },
  bihar: {
    name: 'Bihar',
    level: 'state',
    capital: 'Patna',
    region: 'Middle Gangetic Plain',
    lst_celsius: 44.8,
    wbgt_c: 34.0,
    population_millions: 128.0,
    heat_risk: 'High Vulnerability',
    hap_status: 'Bihar State Heatwave Action Protocol',
    primary_hazard: 'Gaya & Patna heatwave clusters with high socio-economic vulnerability among agricultural workers'
  },
  'madhya-pradesh': {
    name: 'Madhya Pradesh',
    level: 'state',
    capital: 'Bhopal',
    region: 'Central Highlands & Narmada Basin',
    lst_celsius: 45.4,
    wbgt_c: 32.5,
    population_millions: 86.0,
    heat_risk: 'Severe Continental',
    hap_status: 'MP Climate Change Cell Protocol',
    primary_hazard: 'Dry continental heatwaves, Gwalior & Khajuraho heat corridors, water table stress'
  },
  punjab: {
    name: 'Punjab',
    level: 'state',
    capital: 'Chandigarh',
    region: 'North-Western Agricultural Plain',
    lst_celsius: 45.0,
    wbgt_c: 33.2,
    population_millions: 30.5,
    heat_risk: 'High Agricultural Heat',
    hap_status: 'Punjab State Action Plan on Climate Change',
    primary_hazard: 'Intense summer solar insolation and pre-monsoon heatwave spikes affecting crop harvests'
  },
  haryana: {
    name: 'Haryana',
    level: 'state',
    capital: 'Chandigarh',
    region: 'Semi-Arid Yamuna Basin',
    lst_celsius: 45.6,
    wbgt_c: 33.5,
    population_millions: 29.5,
    heat_risk: 'Severe',
    hap_status: 'State Heatwave Management Protocol',
    primary_hazard: 'Hisar & Sirsa severe dry heatwaves reaching 47°C with dust-storm exposure'
  },
  kerala: {
    name: 'Kerala',
    level: 'state',
    capital: 'Thiruvananthapuram',
    region: 'Tropical Malabar Coastal Belt',
    lst_celsius: 36.8,
    wbgt_c: 32.2,
    population_millions: 35.8,
    heat_risk: 'High Humidity Discomfort',
    hap_status: 'Kerala State Heat Illness Surveillance',
    primary_hazard: 'Palakkad thermal gap and high coastal relative humidity causing intense thermal stress'
  },
  odisha: {
    name: 'Odisha',
    level: 'state',
    capital: 'Bhubaneswar',
    region: 'Eastern Coastal & Tribal Highlands',
    lst_celsius: 44.5,
    wbgt_c: 34.8,
    population_millions: 46.2,
    heat_risk: 'Severe Coastal',
    hap_status: 'Odisha Comprehensive Heatwave Action Plan',
    primary_hazard: 'Titlagarh & Jharsuguda severe heat corridors combined with coastal moisture'
  }
};

export function getRegionTelemetry(id, name, level) {
  const normId = (id || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (indiaStateProfiles[normId]) {
    return indiaStateProfiles[normId];
  }
  const normName = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (indiaStateProfiles[normName]) {
    return indiaStateProfiles[normName];
  }

  // Fallback profile
  return {
    name: name || 'Indian Region',
    level: level || 'state',
    capital: 'Regional Center',
    region: 'Climate Sub-Zone',
    lst_celsius: 42.0,
    wbgt_c: 32.5,
    population_millions: 25.0,
    heat_risk: 'Elevated Risk',
    hap_status: 'Active Heat Resilience Protocol',
    primary_hazard: 'Summer heatwave vulnerability, surface temperature anomalies, and urban heat trapping'
  };
}

export function getStateProfile(id, name) {
  return getRegionTelemetry(id, name, 'state');
}
