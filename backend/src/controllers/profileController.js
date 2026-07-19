const User = require("../models/user");

// @route GET /api/profile/me
const getMyProfile = async (req, res) => {
  res.json(req.user);
};

// @route POST /api/profile/complete   (first-time setup)
const completeProfile = async (req, res) => {
  try {
    const { phone, address } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    const user = await User.findById(req.user._id);
    user.phone = phone;
    user.address = address || "";
    if (req.file) user.profilePicture = req.file.path;
    user.isProfileComplete = true;
    await user.save();

    res.json({ message: "Profile completed", user: user.toObject({ getters: true }) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/profile/update   (address + picture only, ever)
// @route PUT /api/profile/update   (address + picture only, ever)
const updateProfile = async (req, res) => {
  try {
    const { address, removePicture } = req.body;
    const user = await User.findById(req.user._id);

    if (address !== undefined) user.address = address;

    if (removePicture === "true") {
      user.profilePicture = "";
    } else if (req.file) {
      user.profilePicture = req.file.path;
    }

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyProfile, completeProfile, updateProfile };