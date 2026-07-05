const { imageUploadUtil } = require("../../helpers/cloudinary.js");
const Property = require("../models/postmodel.js");

// Create Property
const createproperty = async (req, res) => {
  try {
    const {
      propertytitle,
      propertytype,
      price,
      location,
      latitude,
      longitude,
      additional,
      about,
      bedrooms,
      bathrooms,
    } = req.body;

    // Cover image
    let imageUrl = "";

    if (req.files?.image?.[0]) {
      const result = await imageUploadUtil(req.files.image[0].buffer);
      imageUrl = result.secure_url;
    }

    // Gallery images
    let galleryUrls = [];

    if (req.files?.gallery) {
      for (const file of req.files.gallery) {
        const result = await imageUploadUtil(file.buffer);
        galleryUrls.push(result.secure_url);
      }
    }

    const product = new Property({
      userId: req.user.id,
      propertytitle,
      propertytype,
      price,
      location,
      latitude,
      longitude,
      additional,
      about,
      bedrooms,
      bathrooms,
      image: imageUrl,
      gallery: galleryUrls,
    });

    await product.save();

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Edit Property
const editproperty = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      propertytitle,
      propertytype,
      price,
      location,
      latitude,
      longitude,
      additional,
      about,
      bedrooms,
      bathrooms,
    } = req.body;

    // Find property belonging to current user
    const product = await Property.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Update fields
    if (propertytitle !== undefined) product.propertytitle = propertytitle;
    if (propertytype !== undefined) product.propertytype = propertytype;
    if (price !== undefined) product.price = price;
    if (location !== undefined) product.location = location;
    if (latitude !== undefined) product.latitude = latitude;
    if (longitude !== undefined) product.longitude = longitude;
    if (additional !== undefined) product.additional = additional;
    if (about !== undefined) product.about = about;
    if (bedrooms !== undefined) product.bedrooms = bedrooms;
    if (bathrooms !== undefined) product.bathrooms = bathrooms;

    // Replace cover image
    if (req.files?.image?.[0]) {
      const result = await imageUploadUtil(req.files.image[0].buffer);
      product.image = result.secure_url;
    }

    // Add new gallery images while keeping old ones
    let galleryUrls = [...product.gallery];

    if (req.files?.gallery) {
      for (const file of req.files.gallery) {
        const result = await imageUploadUtil(file.buffer);
        galleryUrls.push(result.secure_url);
      }
    }

    product.gallery = galleryUrls;

    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteproperty = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Property.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getmyproperties = async (req, res) => {
  try {
    const properties = await Property.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  getmyproperties,
  createproperty,
  editproperty,
  deleteproperty,
};
