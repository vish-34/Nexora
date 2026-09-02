require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const HeatGrid = require("../models/HeatGrid");
const CoolingCenter = require("../models/CoolingCenter");
const CitizenReport = require("../models/CitizenReport");

function loadJson(sharedRelPath, fallbackRelPath) {
  const sharedPath = path.resolve(__dirname, sharedRelPath);
  if (fs.existsSync(sharedPath)) {
    return JSON.parse(fs.readFileSync(sharedPath, "utf-8"));
  }
  const fallbackPath = path.resolve(__dirname, fallbackRelPath);
  if (fs.existsSync(fallbackPath)) {
    return JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
  }
  throw new Error(`Could not find seed file at ${sharedPath} or ${fallbackPath}`);
}

async function seed() {
  await connectDB();

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

  if (mongoose.connection.readyState === 1) {
    await HeatGrid.deleteMany({});
    await CoolingCenter.deleteMany({});
    await CitizenReport.deleteMany({});

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
    await CoolingCenter.insertMany(shelterData);

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

    console.log(`Seeded ${gridDocs.length} heat grid cells into MongoDB`);
    console.log(`Seeded ${shelterData.length} cooling centers into MongoDB`);
    console.log(`Seeded ${reportDocs.length} citizen reports into MongoDB`);

    await mongoose.connection.close();
    process.exit(0);
  } else {
    console.log("MongoDB is not reachable at the configured URI.");
    console.log(`Validated ${gridData.length} heat grid cells, ${shelterData.length} cooling centers, and ${reportData.length} citizen reports for in-memory serving.`);
    process.exit(0);
  }
}

seed().catch((err) => {
  console.error("Seed script encountered an error:", err);
  process.exit(1);
});
