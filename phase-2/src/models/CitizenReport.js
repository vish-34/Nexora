const mongoose = require("mongoose");

const CitizenReportSchema = new mongoose.Schema(
  {
    id: { type: String, index: true },
    reporter_name: { type: String, default: "Anonymous" },
    reporterName: { type: String, default: "Anonymous" },
    phone: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Hydration Crisis", "Heat Exhaustion", "Broken Infrastructure", "Shelter Needed", "General"],
      default: "Hydration Crisis",
    },
    description: { type: String, required: true, maxlength: 1000 },

    location: {
      type: { type: String, enum: ["Point"], default: "Point", required: true },
      coordinates: { type: [Number], required: true },
    },

    zone_id: { type: String, index: true },
    urgency: {
      type: String,
      enum: ["Emergency", "Critical", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In-Progress", "Dispatched", "Resolved", "Closed", "Submitted"],
      default: "Pending",
      index: true,
    },

    ai_triage: {
      confidence: { type: Number, default: 0.9 },
      extracted_entities: [{ type: String }],
      recommended_action: { type: String, default: "" },
    },

    triage: {
      severity: { type: String },
      category: { type: String },
      recommendedAction: { type: String },
      confidence: { type: Number },
      source: { type: String },
      triagedAt: { type: Date },
    },

    symptoms: [{ type: String }],
    photoUrl: { type: String },
    nearestShelter: { type: mongoose.Schema.Types.ObjectId, ref: "CoolingCenter", default: null },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CitizenReportSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("CitizenReport", CitizenReportSchema);
