const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../../auth/controllers/authcontroller");

const { reportIssue } = require("../controllers/issuecontroller");

router.post("/report-issue", authMiddleware, reportIssue);

module.exports = router;
