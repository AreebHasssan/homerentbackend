const express = require("express");
const router = express.Router();

const {
  createproperty,
  editproperty,
  deleteproperty,
  getmyproperties,
} = require("../controllers/postcontroller.js");

const { authMiddleware } = require("../../auth/controllers/authcontroller.js");

const upload = require("../../helpers/cloudinary.js").upload;
router.post(
  "/property",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  createproperty,
);

router.get("/getproperty", authMiddleware, getmyproperties);

router.put(
  "/editproperty/:id",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  editproperty,
);

router.delete("/deleteproperty/:id", authMiddleware, deleteproperty);

module.exports = router;
