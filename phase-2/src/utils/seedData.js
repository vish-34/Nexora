require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const HeatGrid = require("../models/HeatGrid");
const CoolingCenter = require("../models/CoolingCenter");
const CitizenReport = require("../models/CitizenReport");

function loadJson(sharedRelPath, fallbackRelPath) {
  const possiblePaths = [
    path.resolve(__dirname, sharedRelPath),
    path.resolve(__dirname, fallbackRelPath),
    path.resolve(__dirname, "../../../shared", path.basename(sharedRelPath)),
    path.resolve(__dirname, "../../data", path.basename(fallbackRelPath)),
    path.resolve(process.cwd(), "data", path.basename(fallbackRelPath)),
    path.resolve(process.cwd(), "../shared", path.basename(sharedRelPath)),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, "utf-8"));
      } catch (err) {
        console.warn(`Error reading ${p}:`, err.message);
      }
    }
  }
  console.warn(`Could not find seed file: ${sharedRelPath} / ${fallbackRelPath}`);
  return [];
}

async function seedDatabase(options = { clearExisting: false }) {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  if (mongoose.connection.readyState !== 1) {
    console.log("MongoDB is not reachable. Operating in resilient in-memory mode.");
    return { success: false, reason: "DB not connected" };
  }

  const gridData = loadJson(
    "../../../../shared/mumbai_heat_grid.json",
    "../../data/mumbai_heat_grid.sample.json"
  );
  const shelterData = loadJson(
    "../../../../shared/cooling_centers.json",
    "../../data/cooling_centers.sample.json"
  );
  const reportData = loadJson(
    "../../../../shared/sample_reports.json",
    "../../data/sample_reports.sample.json"
  );

  if (options.clearExisting) {
    await HeatGrid.deleteMany({});
    await CoolingCenter.deleteMany({});
    await CitizenReport.deleteMany({});
  }

  let seededGrid = 0;
  let seededShelters = 0;
  let seededReports = 0;

  if (gridData.length > 0) {
    const gridDocs = gridData.map((c) => ({
      ...c,
      zone_id: c.zone_id || c.cellId,
      cellId: c.zone_id || c.cellId,
      population_density_per_sqkm:
        c.population_density_per_sqkm || c.population_density || c.populationDensity || 50000,
      chrs: {
        score: c.chrs_risk_score,
        band: (c.risk_level || "Moderate").toLowerCase(),
        computedAt: new Date(),
        source: "sourced_landsat8_sentinel2",
      },
    }));
    await HeatGrid.insertMany(gridDocs);
    seededGrid = gridDocs.length;
  }

  if (shelterData.length > 0) {
    await CoolingCenter.insertMany(shelterData);
    seededShelters = shelterData.length;
  }

  if (reportData.length > 0) {
    const reportDocs = reportData.map((r, i) => {
      const lat = r.location?.lat ?? (Array.isArray(r.location?.coordinates) ? r.location.coordinates[1] : 19.043);
      const lng = r.location?.lng ?? (Array.isArray(r.location?.coordinates) ? r.location.coordinates[0] : 72.855);

      return {
        id: `REP_${1001 + i}`,
        reporter_name: r.reporter_name || r.reporterName || "Anonymous",
        phone: r.phone || r.contactPhone || "+91 98201 XXXXX",
        category: r.category || "Hydration Crisis",
        description: r.description || "Heat emergency distress report.",
        location: { type: "Point", coordinates: [lng, lat] },
        urgency: r.urgency || (r.description && r.description.toLowerCase().includes("unconscious") ? "Emergency" : "Critical"),
        status: r.status || "Submitted",
        ai_triage: r.ai_triage || {
          urgency: r.urgency || "Emergency",
          confidence: 0.95,
          extracted_entities: r.symptoms || ["heat distress"],
          recommended_action: "Dispatch emergency relief and monitor hydration status",
        },
        created_at: new Date(),
      };
    });
    await CitizenReport.insertMany(reportDocs);
    seededReports = reportDocs.length;
  }

  console.log(`[Auto-Seed] Successfully seeded: ${seededGrid} heat grid cells, ${seededShelters} shelters, ${seededReports} citizen reports.`);
  return {
    success: true,
    gridCount: seededGrid,
    sheltersCount: seededShelters,
    reportsCount: seededReports,
  };
}

if (require.main === module) {
  seedDatabase({ clearExisting: true })
    .then(async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed script encountered an error:", err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };

