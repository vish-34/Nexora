const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Intervention = require("../models/Intervention");

let inMemoryProposals = [];

const listProposals = asyncHandler(async (req, res) => {
  const { zone_id, status } = req.query;

  let proposals = [];
  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (zone_id) filter.zone_id = zone_id;
      if (status) filter.status = status;
      proposals = await Intervention.find(filter).sort({ createdAt: -1 }).lean();
    } catch (e) {
      proposals = inMemoryProposals;
    }
  } else {
    proposals = inMemoryProposals;
    if (zone_id) proposals = proposals.filter((p) => p.zone_id === zone_id);
    if (status) proposals = proposals.filter((p) => p.status === status);
  }

  res.json({ count: proposals.length, proposals });
});

const createProposal = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const proposalId = body.proposal_id || `PROP_${Date.now().toString().slice(-6)}`;

  const trees = Number(body.trees_added || body.canopy_trees_added || 0);
  const coolRoof = Number(body.cool_roof_sqm || 0);
  const kiosks = Number(body.kiosks_added || body.water_kiosks_added || 0);

  const proposalObj = {
    proposal_id: proposalId,
    zone_id: body.zone_id || "GRID_MUM_001",
    trees_added: trees,
    cool_roof_sqm: coolRoof,
    kiosks_added: kiosks,
    interventions: {
      canopy_trees_added: trees,
      cool_roof_sqm: coolRoof,
      water_kiosks_added: kiosks,
    },
    original_chrs: Number(body.original_chrs || 85),
    simulated_chrs: Number(body.simulated_chrs || body.projected_risk || 65),
    projected_risk: Number(body.projected_risk || body.simulated_chrs || 65),
    predicted_lst_drop_c: Number(body.predicted_lst_drop_c || 1.8),
    population_benefited: Number(body.population_benefited || 42000),
    budget_inr: Number(body.budget_inr || body.estimated_budget_inr || 850000),
    estimated_budget_inr: Number(body.estimated_budget_inr || body.budget_inr || 850000),
    co2_offset_tons_per_yr: Number(body.co2_offset_tons_per_yr || 5.5),
    payback_roi_rating: body.payback_roi_rating || "High Priority",
    status: body.status || "Submitted",
    submitted_by: body.submitted_by || "Municipal Urban Planner",
    created_at: new Date().toISOString(),
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const saved = await Intervention.create(proposalObj);
      return res.status(201).json({ status: "success", proposal: saved });
    } catch (e) {
      inMemoryProposals.unshift(proposalObj);
    }
  } else {
    inMemoryProposals.unshift(proposalObj);
  }

  res.status(201).json({ status: "success", proposal: proposalObj });
});

module.exports = { listProposals, createProposal };
