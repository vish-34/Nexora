const express = require("express");
const router = express.Router();
const c = require("../controllers/weatherController");

router.get("/current", c.currentWeather);
router.get("/live", c.currentWeather);

module.exports = router;
