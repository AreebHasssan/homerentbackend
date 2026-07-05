const mongoose = require("mongoose");

const authSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    default: "property-owner",
  },
  memberSince: {
    type: String,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    default: "en",
  },
});

const auth = mongoose.model("auth", authSchema);

module.exports = auth;
