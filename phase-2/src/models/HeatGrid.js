const mongoose = require("mongoose");

const HeatGridSchema = new mongoose.Schema(
  {
    zone_id: { type: String, required: true, unique: true, index: true },
    cellId: { type: String, index: true },
    name: { type: String, required: true },
    ward: { type: String, index: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },

    geometry: {
      type: { type: String, enum: ["Polygon"], default: "Polygon" },
      coordinates: { type: [[[Number]]], required: true },
    },

    polygon: {
      type: { type: String, enum: ["Polygon"], default: "Polygon" },
      coordinates: { type: [[[Number]]] },
    },

    landCover: { type: String, default: "dense_urban" },
    lst_celsius: { type: Number, required: true },
    surfaceTempC: { type: Number },
    ambientTempC: { type: Number },
    humidityPct: { type: Number },
    wbgt_c: { type: Number },
    wbgtC: { type: Number },
    ndvi: { type: Number, required: true },
    ndbi: { type: Number, required: true },
    population_density_per_sqkm: { type: Number, default: 50000 },
    population_density: { type: Number, default: 50000 },
    populationDensity: { type: Number, default: 50000 },
    elderly_percentage: { type: Number, required: true },
    elderlyPct: { type: Number },
    informal_housing_ratio: { type: Number, default: 0.5 },
    canopy_cover_pct: { type: Number, default: 10.0 },
    drinking_water_access_score: { type: Number, default: 5.0 },
    chrs_risk_score: { type: Number, required: true, min: 0, max: 100 },
    risk_level: { type: String, enum: ["Low", "Moderate", "High", "Critical"], default: "Moderate" },
    primary_hazard_driver: { type: String },

    chrs: {
      score: { type: Number },
      band: { type: String },
      computedAt: { type: Date, default: Date.now },
      source: { type: String, default: "phase3_live" },
    },
  },
  { timestamps: true }
);

HeatGridSchema.index({ location: "2dsphere" });
HeatGridSchema.index({ geometry: "2dsphere" });

module.exports = mongoose.model("HeatGrid", HeatGridSchema);
