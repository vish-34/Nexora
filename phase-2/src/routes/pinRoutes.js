const express = require("express");
const router = express.Router();
const { getPins, createPin } = require("../controllers/pinController");

router.route("/").get(getPins).post(createPin);

module.exports = router;
