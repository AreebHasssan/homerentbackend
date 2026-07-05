const express = require("express");
const router = express.Router();

const Profile = require("../models/profilemodel.js");
const { authMiddleware } = require("../../auth/controllers/authcontroller");
const upload = require("../../helpers/cloudinary.js").upload;
const { updateProfile } = require("../controllers/profilecontroller");

router.get("/profile", authMiddleware, async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user.id });

  res.status(200).json({
    success: true,
    profile,
  });
});

router.put("/profile", authMiddleware, upload.single("image"), updateProfile);

module.exports = router;
