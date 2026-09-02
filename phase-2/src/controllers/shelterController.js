const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const turf = require("@turf/turf");
const CoolingCenter = require("../models/CoolingCenter");

let fallbackShelters;
try {
  fallbackShelters = require("../../../Nexora/shared/cooling_centers.json");
} catch (e) {
  fallbackShelters = require("../../data/cooling_centers.sample.json");
}

function calculateDistanceTurf(lat1, lon1, lat2, lon2) {
  try {
    const from = turf.point([lon1, lat1]);
    const to = turf.point([lon2, lat2]);
    const d = turf.distance(from, to, { units: "meters" });
    return Math.round(d);
  } catch (err) {
    const r = 6371000;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(r * c);
  }
}

function formatShelterResponse(s, queryLat, queryLng) {
  const [lng, lat] = s.location?.coordinates || [72.85, 19.04];
  const dist =
    queryLat != null && queryLng != null
      ? calculateDistanceTurf(queryLat, queryLng, lat, lng)
      : undefined;

  return {
    id: s.id,
    name: s.name,
    category: s.category || "Emergency Cooling Shelter",
    ward: s.ward,
    location: { lat, lng },
    address: s.address,
    operating_hours: s.operating_hours || s.openHours || "08:00 - 20:00",
    capacity: s.capacity,
    current_occupancy: s.current_occupancy ?? s.currentOccupancy ?? 0,
    amenities: s.amenities || [],
    contact: s.contact || s.contactPhone,
    status: s.status || "Open",
    verified: s.verified !== false,
    distance_meters: dist,
  };
}

const listShelters = asyncHandler(async (req, res) => {
  const { type, operational, lat, lng, radius_km, radiusM } = req.query;
  const queryLat = lat != null ? Number(lat) : null;
  const queryLng = lng != null ? Number(lng) : null;
  const radiusMeters = radius_km ? Number(radius_km) * 1000 : Number(radiusM || 5000);

  let shelters = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (type) filter.type = type;
      if (operational !== undefined) filter.operational = operational === "true";

      if (queryLat != null && queryLng != null) {
        filter.location = {
          $near: {
            $geometry: { type: "Point", coordinates: [queryLng, queryLat] },
            $maxDistance: radiusMeters,
          },
        };
      }

      shelters = await CoolingCenter.find(filter).lean();
    } catch (e) {
      shelters = fallbackShelters;
    }
  } else {
    shelters = fallbackShelters;
  }

  if (!shelters || shelters.length === 0) {
    shelters = fallbackShelters;
  }

  const results = shelters
    .map((s) => formatShelterResponse(s, queryLat, queryLng))
    .filter((s) => {
      if (queryLat != null && queryLng != null && s.distance_meters != null) {
        return s.distance_meters <= radiusMeters;
      }
      return true;
    });

  if (queryLat != null && queryLng != null) {
    results.sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0));
  }

  if (req.originalUrl.includes("/api/v1/shelters")) {
    return res.json({ count: results.length, shelters: results });
  }

  res.json(results);
});

const nearbyShelters = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng query params are required" });
  }
  const radiusMeters = req.query.radius_km ? Number(req.query.radius_km) * 1000 : Number(req.query.radiusM || 5000);

  let shelters = [];
  if (mongoose.connection.readyState === 1) {
    try {
      shelters = await CoolingCenter.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radiusMeters,
          },
        },
      })
        .limit(30)
        .lean();
    } catch (e) {
      shelters = fallbackShelters;
    }
  } else {
    shelters = fallbackShelters;
  }

  if (!shelters || shelters.length === 0) {
    shelters = fallbackShelters;
  }

  const results = shelters
    .map((s) => formatShelterResponse(s, lat, lng))
    .filter((s) => s.distance_meters == null || s.distance_meters <= radiusMeters)
    .sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0));

  res.json(results);
});

const getShelter = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const shelter = await CoolingCenter.findOne({ id: req.params.id }).lean();
      if (shelter) return res.json(formatShelterResponse(shelter));
    } catch (e) { }
  }
  const found = fallbackShelters.find((s) => s.id === req.params.id);
  if (!found) return res.status(404).json({ error: "Shelter not found" });
  res.json(formatShelterResponse(found));
});

const createShelter = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const shelter = await CoolingCenter.create(req.body);
      return res.status(201).json(formatShelterResponse(shelter));
    } catch (e) { }
  }
  res.status(201).json(formatShelterResponse(req.body));
});

const updateShelter = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const shelter = await CoolingCenter.findOneAndUpdate({ id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      if (shelter) return res.json(formatShelterResponse(shelter));
    } catch (e) { }
  }
  res.json(formatShelterResponse(req.body));
});

const deleteShelter = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await CoolingCenter.findOneAndDelete({ id: req.params.id });
    } catch (e) { }
  }
  res.json({ deleted: true });
});

module.exports = {
  listShelters,
  nearbyShelters,
  getShelter,
  createShelter,
  updateShelter,
  deleteShelter,
};
