const cloudinary = require("cloudinary").v2;
const multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
async function imageUploadUtil(fileBuffer) {
  try {
    const base64 = `data:image/png;base64,${fileBuffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      resource_type: "auto",
      folder: "profiles",
    });

    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = {
  upload,
  imageUploadUtil,
};
