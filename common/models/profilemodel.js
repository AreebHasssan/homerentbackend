const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "auth",
    required: true,
    unique: true,
  },
  about: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("profile", profileSchema);
