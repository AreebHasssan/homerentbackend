const express = require("express");
const router = express.Router();

const {
  addBookmark,
  getBookmarks,
  removeBookmark,
} = require("../controllers/bookmarkcontroller");
const { authMiddleware } = require("../../auth/controllers/authcontroller");

router.post("/", authMiddleware, addBookmark);
router.post("/add", authMiddleware, addBookmark);
router.get("/", authMiddleware, getBookmarks);
router.get("/getall", authMiddleware, getBookmarks);
router.delete("/:propertyId", authMiddleware, removeBookmark);
router.delete("/remove/:propertyId", authMiddleware, removeBookmark);

module.exports = router;
