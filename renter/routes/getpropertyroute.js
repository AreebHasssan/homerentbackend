const express = require("express");
const router = express.Router();

const { getRenterDashboard } = require("../controllers/getpropertycontrollers");
const { authMiddleware } = require("../../auth/controllers/authcontroller");

router.get("/me", authMiddleware, getRenterDashboard);

module.exports = router;
