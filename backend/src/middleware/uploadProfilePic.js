const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile-pictures",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG and PNG images are allowed"), false);
};

const uploadProfilePic = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

module.exports = uploadProfilePic;