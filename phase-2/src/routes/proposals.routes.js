const express = require("express");
const router = express.Router();
const c = require("../controllers/proposals.controller");

router.get("/", c.listProposals);
router.post("/", c.createProposal);

module.exports = router;
