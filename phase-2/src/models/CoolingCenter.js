const mongoose = require("mongoose");

const CoolingCenterSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, default: "Emergency Cooling Shelter" },
    type: { type: String, default: "cooling_center" },
    ward: { type: String, index: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point", required: true },
      coordinates: { type: [Number], required: true },
    },

    address: { type: String },
    operating_hours: { type: String, default: "08:00 - 20:00" },
    openHours: { type: String, default: "08:00 - 20:00" },
    capacity: { type: Number, default: 100 },
    current_occupancy: { type: Number, default: 0 },
    currentOccupancy: { type: Number, default: 0 },
    amenities: [{ type: String }],
    contact: { type: String },
    contactPhone: { type: String },
    status: { type: String, enum: ["Open", "Crowded", "Full", "Closed"], default: "Open" },
    operational: { type: Boolean, default: true },
    verified: { type: Boolean, default: true },
    hasAC: { type: Boolean, default: true },
    hasMedicalStaff: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CoolingCenterSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("CoolingCenter", CoolingCenterSchema);
