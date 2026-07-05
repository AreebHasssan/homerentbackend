const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
      required: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("contact", contactSchema);
