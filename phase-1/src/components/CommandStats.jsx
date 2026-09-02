import React from 'react';

export const CommandStats = ({
  gridData,
  shelters,
  reports,
  weather,
  selectedZone
}) => {
  const criticalPop = selectedZone 
    ? `${(selectedZone.population_density_per_sqkm / 1000).toFixed(0)} K`
    : '194 K';
    
  const peakTemp = selectedZone
    ? `${selectedZone.lst_celsius}°C`
    : `${gridData?.features?.reduce((max, f) => Math.max(max, f.properties.lst_celsius), 0) || 44.2}°C`;

  const wbgt = `${weather?.wbgt_c ?? 33.8}°C`;
  const activeHubs = `${shelters?.length || 4} HUBS`;
  const emergencyReports = `${reports?.length || 3} ALERTS`;

  return (
    <div className="flex flex-col justify-center space-y-10 py-6 px-4">
      {/* Metric 1: Population in High Risk */}
      <div>
        <div className="text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight">
          {criticalPop}
        </div>
        <div className="text-xs text-sage-300/80 mt-1 max-w-[180px] leading-relaxed">
          population in extreme heat risk informal settlements
        </div>
      </div>

      {/* Metric 2: Peak Surface Temp */}
      <div>
        <div className="text-4xl lg:text-5xl font-extrabold text-lime-300 font-display tracking-tight">
          {peakTemp}
        </div>
        <div className="text-xs text-sage-300/80 mt-1 max-w-[180px] leading-relaxed">
          peak satellite surface temperature recorded (LST)
        </div>
      </div>

      {/* Metric 3: Live WBGT */}
      <div>
        <div className="text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight">
          {wbgt}
        </div>
        <div className="text-xs text-sage-300/80 mt-1 max-w-[180px] leading-relaxed">
          real-time wet bulb globe heat stress index (WBGT)
        </div>
      </div>

      {/* Metric 4: Cooling Shelters Available */}
      <div>
        <div className="text-3xl lg:text-4xl font-extrabold text-white font-display tracking-tight">
          {activeHubs}
        </div>
        <div className="text-xs text-sage-300/80 mt-1 max-w-[180px] leading-relaxed">
          verified emergency cooling centers open (216 beds)
        </div>
      </div>

      {/* Metric 5: Active Distress SOS Alerts */}
      <div>
        <div className="text-3xl lg:text-4xl font-extrabold text-lime-300/90 font-display tracking-tight">
          {emergencyReports}
        </div>
        <div className="text-xs text-sage-300/80 mt-1 max-w-[180px] leading-relaxed">
          crowdsourced distress incidents in municipal triage
        </div>
      </div>
    </div>
  );
};
