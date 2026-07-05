const express = require("express");
const router = express.Router();

const { sendRentRequest } = require("../controllers/rentcontroller");
const { authMiddleware } = require("../../auth/controllers/authcontroller");

router.post("/send-rent-request", authMiddleware, sendRentRequest);

module.exports = router;
