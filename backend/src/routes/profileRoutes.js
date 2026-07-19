const express = require("express");
const { getMyProfile, completeProfile, updateProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");
const uploadProfilePic = require("../middleware/uploadProfilePic");

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.post("/complete", protect, uploadProfilePic.single("profilePicture"), completeProfile);
router.put("/update", protect, uploadProfilePic.single("profilePicture"), updateProfile);

module.exports = router;