const mongoose = require("mongoose");

const PinSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: [
        "hotspot",
        "low_veg",
        "water_needed",
        "cooling_centre",
        "citizen_report",
        "vulnerability",
      ],
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    heat_risk: { type: Number, default: 75 },
    lst_celsius: { type: Number, default: 42.0 },
    // Tree count fetched from official sources (BMC Tree Census & FSI)
    tree_count: { type: Number, default: 1200 },
    tree_source: { type: String, default: "BMC Tree Census 2024 / Forest Survey of India" },
    population: { type: String, default: "High" },
    level: {
      type: String,
      enum: ["country", "state", "district"],
      required: true,
      index: true,
    },
    parentId: { type: String, required: true, index: true },
    stateId: { type: String, index: true },
    districtId: { type: String, index: true },

    coordinates: {
      lng: { type: Number, required: true },
      lat: { type: Number, required: true },
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [lng, lat]
    },

    details: { type: String },
    action_label: { type: String, default: "Inspect" },
    action_type: {
      type: String,
      enum: ["xai", "coolpath", "whatif", "report"],
      default: "xai",
    },
  },
  { timestamps: true }
);

PinSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Pin", PinSchema);
