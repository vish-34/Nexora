const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const CitizenReport = require("../models/CitizenReport");
const CoolingCenter = require("../models/CoolingCenter");
const aiGatewayService = require("../services/aiGatewayService");

let inMemoryReports = [
  {
    id: "REP_1001",
    reporter_name: "Ramesh Patil",
    phone: "+91 98201 XXXXX",
    category: "Hydration Crisis",
    description:
      "Public drinking water tap at transit camp crossroad has no water. Construction workers having heat dizziness.",
    location: { type: "Point", coordinates: [72.855, 19.043] },
    zone_id: "GRID_MUM_001",
    urgency: "Emergency",
    status: "In-Progress",
    ai_triage: {
      urgency: "Emergency",
      confidence: 0.96,
      extracted_entities: ["drinking water tap", "heat dizziness", "workers"],
      recommended_action:
        "Dispatch emergency municipal water tanker & ORS distribution kit",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "REP_1002",
    reporter_name: "Dr. Sunita Rao",
    phone: "+91 98192 XXXXX",
    category: "Heat Exhaustion",
    description:
      "Elderly patient collapsed near platform 1 bus queue due to severe sun exposure and 42 degree surface heat.",
    location: { type: "Point", coordinates: [72.8715, 19.067] },
    zone_id: "GRID_MUM_002",
    urgency: "Critical",
    status: "Dispatched",
    ai_triage: {
      urgency: "Critical",
      confidence: 0.98,
      extracted_entities: [
        "elderly collapsed",
        "sun exposure",
        "station bus queue",
      ],
      recommended_action:
        "Send 108 ambulance and escort to Kurla Station Cooling Kiosk",
    },
    created_at: new Date().toISOString(),
  },
];

let wsBroadcaster = null;
function setWsBroadcaster(fn) {
  wsBroadcaster = fn;
}

function formatReport(r) {
  const [lng, lat] = r.location?.coordinates || [72.855, 19.043];
  return {
    id: r.id,
    reporter_name: r.reporter_name || r.reporterName || "Anonymous",
    phone: r.phone || r.contactPhone || "",
    category: r.category || "Hydration Crisis",
    description: r.description,
    location: { lat, lng },
    geo_location: r.location,
    zone_id: r.zone_id,
    urgency: r.urgency || "Medium",
    status: r.status || "Pending",
    ai_triage: r.ai_triage || {
      confidence: 0.9,
      extracted_entities: [],
      recommended_action: "Monitor situation",
    },
    created_at: r.created_at || r.createdAt || new Date().toISOString(),
  };
}

const listReports = asyncHandler(async (req, res) => {
  const { status, urgency, zone_id } = req.query;
  let reports = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (status) filter.status = status;
      if (urgency) filter.urgency = urgency;
      if (zone_id) filter.zone_id = zone_id;
      reports = await CitizenReport.find(filter)
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();
    } catch (e) {
      reports = inMemoryReports;
    }
  } else {
    reports = inMemoryReports;
    if (status) reports = reports.filter((r) => r.status === status);
    if (urgency) reports = reports.filter((r) => r.urgency === urgency);
    if (zone_id) reports = reports.filter((r) => r.zone_id === zone_id);
  }

  const formatted = reports.map(formatReport);

  if (req.originalUrl.includes("/api/v1/reports")) {
    return res.json({ count: formatted.length, reports: formatted });
  }

  res.json(formatted);
});

const getReport = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (mongoose.connection.readyState === 1) {
    try {
      const report = await CitizenReport.findOne({
        $or: [{ id: targetId }, { _id: targetId }],
      }).lean();
      if (report) return res.json(formatReport(report));
    } catch (e) {}
  }

  const found = inMemoryReports.find(
    (r) => r.id === targetId || r._id === targetId
  );
  if (!found) return res.status(404).json({ error: "Report not found" });
  res.json(formatReport(found));
});

const createReport = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const reporterName = body.reporter_name || body.reporterName || "Anonymous";
  const phone = body.phone || body.contactPhone || "";
  const category = body.category || "Hydration Crisis";
  const description = body.description || "";
  const zoneId = body.zone_id || null;

  let lat = body.location?.lat ?? body.lat;
  let lng = body.location?.lng ?? body.lng;

  if (lat == null || lng == null) {
    lat = 19.043;
    lng = 72.855;
  }

  if (!description) {
    return res.status(400).json({ error: "description is required" });
  }

  const triageResult = await aiGatewayService.triageDistress(
    description,
    category,
    reporterName,
    { lat, lng },
    phone
  );
  const reportId = `REP_${Date.now().toString().slice(-6)}`;
  const urgency = triageResult.urgency || "Medium";

  let nearestShelter = null;
  if (mongoose.connection.readyState === 1) {
    try {
      nearestShelter = await CoolingCenter.findOne({
        operational: true,
        location: {
          $near: { $geometry: { type: "Point", coordinates: [lng, lat] } },
        },
      }).lean();
    } catch (e) {}
  }

  const reportDoc = {
    id: reportId,
    reporter_name: reporterName,
    reporterName: reporterName,
    phone,
    contactPhone: phone,
    category,
    description,
    location: { type: "Point", coordinates: [lng, lat] },
    zone_id: zoneId,
    urgency,
    status: "Submitted",
    ai_triage: {
      urgency,
      confidence: triageResult.confidence || 0.94,
      extracted_entities: triageResult.extracted_entities || [],
      recommended_action:
        triageResult.recommended_action || "Log for municipal review",
    },
    nearestShelter: nearestShelter?._id || null,
    created_at: new Date().toISOString(),
  };

  if (mongoose.connection.readyState === 1) {
    try {
      await CitizenReport.create(reportDoc);
    } catch (e) {
      inMemoryReports.unshift(reportDoc);
    }
  } else {
    inMemoryReports.unshift(reportDoc);
  }

  if (wsBroadcaster) {
    try {
      wsBroadcaster({
        event: "distress_report_created",
        data: formatReport(reportDoc),
      });
    } catch (e) {}
  }

  res.status(201).json({
    id: reportId,
    status: "Submitted",
    ai_triage: reportDoc.ai_triage,
    report: formatReport(reportDoc),
    nearest_shelter: nearestShelter,
  });
});

const updateReport = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (mongoose.connection.readyState === 1) {
    try {
      const report = await CitizenReport.findOneAndUpdate(
        { $or: [{ id: targetId }, { _id: targetId }] },
        req.body,
        { new: true, runValidators: true }
      );
      if (report) return res.json(formatReport(report));
    } catch (e) {}
  }

  const idx = inMemoryReports.findIndex(
    (r) => r.id === targetId || r._id === targetId
  );
  if (idx === -1) return res.status(404).json({ error: "Report not found" });
  inMemoryReports[idx] = { ...inMemoryReports[idx], ...req.body };
  res.json(formatReport(inMemoryReports[idx]));
});

module.exports = {
  listReports,
  getReport,
  createReport,
  updateReport,
  setWsBroadcaster,
};
