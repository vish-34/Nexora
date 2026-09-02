const express = require("express");
const router = express.Router();
const c = require("../controllers/reportController");

router.get("/:id", c.getReport);
router.get("/", c.listReports);
router.post("/", c.createReport);
router.patch("/:id", c.updateReport);

module.exports = router;
