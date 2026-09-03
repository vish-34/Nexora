const express = require("express");
const router = express.Router();
const { signup, signin, getMe, logout } = require("../controllers/authController");

// Authentication Endpoints
router.post("/signup", signup);
router.post("/register", signup);
router.post("/signin", signin);
router.post("/login", signin);
router.post("/logout", logout);
router.get("/me", getMe);

module.exports = router;
