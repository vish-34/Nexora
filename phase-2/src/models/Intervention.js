const mongoose = require("mongoose");

const InterventionSchema = new mongoose.Schema(
  {
    proposal_id: { type: String, required: true, unique: true, index: true },
    zone_id: { type: String, required: true, index: true },
    trees_added: { type: Number, default: 0 },
    cool_roof_sqm: { type: Number, default: 0 },
    kiosks_added: { type: Number, default: 0 },
    interventions: {
      canopy_trees_added: { type: Number, default: 0 },
      cool_roof_sqm: { type: Number, default: 0 },
      water_kiosks_added: { type: Number, default: 0 },
    },
    original_chrs: { type: Number },
    simulated_chrs: { type: Number },
    projected_risk: { type: Number },
    predicted_lst_drop_c: { type: Number },
    population_benefited: { type: Number, default: 0 },
    estimated_budget_inr: { type: Number, default: 0 },
    budget_inr: { type: Number, default: 0 },
    co2_offset_tons_per_yr: { type: Number, default: 0 },
    payback_roi_rating: { type: String, default: "High Priority" },
    status: { type: String, enum: ["Draft", "Submitted", "Approved"], default: "Submitted" },
    submitted_by: { type: String, default: "Municipal Urban Planner" },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Intervention", InterventionSchema);
