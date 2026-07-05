const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

bookmarkSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
