const express = require("express");
const router = express.Router();
const c = require("../controllers/shelterController");

router.get("/nearby", c.nearbyShelters);
router.get("/near", c.nearbyShelters);
router.get("/:id", c.getShelter);
router.get("/", c.listShelters);
router.post("/", c.createShelter);
router.patch("/:id", c.updateShelter);
router.delete("/:id", c.deleteShelter);

module.exports = router;
