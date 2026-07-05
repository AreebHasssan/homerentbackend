const Profile = require("../models/profilemodel");
const { imageUploadUtil } = require("../../helpers/cloudinary.js");
const updateProfile = async (req, res) => {
  try {
    const { about, removeImage } = req.body;

    let imageUrl = "";

    if (req.file) {
      const result = await imageUploadUtil(req.file.buffer);
      imageUrl = result.secure_url;
    }
    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = await Profile.create({
        userId: req.user.id,
        about: about || "",
        image: imageUrl,
      });
    } else {
      if (about !== undefined) profile.about = about;
      if (imageUrl) {
        profile.image = imageUrl;
      } else if (removeImage === "true") {
        profile.image = "";
      }

      await profile.save();
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  updateProfile,
};
