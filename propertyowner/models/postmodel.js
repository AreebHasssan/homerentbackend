const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  propertytitle: { type: String, required: true },
  propertytype: {
    type: String,
    required: true,
    enum: ["House", "Apartment", "Villa", "Cottage", "Hotel"],
  },
  price: { type: String, required: true },
  location: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  additional: { type: String, required: true },
  about: { type: String, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  image: { type: String, required: true },
  gallery: { type: [String], required: true },
});

Property = mongoose.model("property", propertySchema);

module.exports = Property;
