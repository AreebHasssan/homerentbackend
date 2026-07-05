const Bookmark = require("../models/bookmarkmodel");

const addBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.body;

    const exists = await Bookmark.findOne({ userId, propertyId });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Already bookmarked",
      });
    }

    await Bookmark.create({
      userId,
      propertyId,
    });

    res.json({
      success: true,
      message: "Property bookmarked",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookmarks = await Bookmark.find({ userId })
      .populate("propertyId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookmarks,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const removeBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    await Bookmark.findOneAndDelete({
      userId,
      propertyId,
    });

    res.json({
      success: true,
      message: "Bookmark removed",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
module.exports = { addBookmark, getBookmarks, removeBookmark };
