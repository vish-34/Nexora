const express = require("express");
const router = express.Router();
const c = require("../controllers/gridController");

router.get("/near", c.nearbyCells);
router.get("/:cellId/explain", c.explainCell);
router.post("/:cellId/whatif", c.whatIfCell);
router.post("/:cellId/refresh-weather", c.refreshWeather);
router.post("/:cellId/chrs", c.computeChrs);
router.get("/:cellId", c.getCell);
router.get("/", c.listCells);
router.post("/", c.upsertCells);

module.exports = router;
