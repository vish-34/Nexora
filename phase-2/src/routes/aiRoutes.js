const express = require("express");
const router = express.Router();
const c = require("../controllers/aiProxyController");

router.get("/status", c.aiStatus);
router.get("/explain/:zone_id", c.explainZone);
router.post("/simulate", c.simulatePolicy);
router.post("/coolpath", c.coolPathRoute);
router.post("/triage", c.triageRoute);
router.post("/screen-explain", c.screenExplainRoute);

module.exports = router;
