const express = require("express");
const router = express.Router();
const auth = require("../models/authmodel");
const {
  register,
  login,
  logoutUser,
  authMiddleware,
  changepassword,
  deleteaccount,
  updateDarkMode,
  updateLanguage,
} = require("../controllers/authcontroller");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logoutUser);

router.get("/check-auth", authMiddleware, async (req, res) => {
  const currentUser = await auth.findById(req.user.id).select("-password");

  res.status(200).json({
    success: true,
    user: currentUser,
  });
});
router.put("/language", authMiddleware, updateLanguage);
router.put("/changepassword", authMiddleware, changepassword);
router.delete("/deleteaccount", authMiddleware, deleteaccount);
router.put("/darkmode", authMiddleware, updateDarkMode);
module.exports = router;
