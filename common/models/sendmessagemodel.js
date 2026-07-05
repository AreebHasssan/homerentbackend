const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    read: {
      type: Boolean,
      default: false,
    },

    edited: {
      type: Boolean,
      default: false,
    },

    toastDismissed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("message", messageSchema);
