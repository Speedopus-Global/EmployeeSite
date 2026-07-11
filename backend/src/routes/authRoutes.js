const express = require("express");
const { registerUser, loginUser, logoutUser, getMe , verifyOtp, resendOtp} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/me", protect, getMe);

module.exports = router;