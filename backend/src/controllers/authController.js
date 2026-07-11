const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const { sendAdminNewEmployeeAlert, sendOtpEmail } = require("../utils/emailService");

// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role: "employee" });

    sendAdminNewEmployeeAlert(user); // fire-and-forget, doesn't block response

    res.status(201).json({
      message: "Registration successful. Awaiting admin approval.",
      user: { id: user._id, name: user.name, email: user.email, status: user.status },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    if (user.status === "pending")
      return res.status(403).json({ message: "Account pending admin approval" });
    if (user.status !== "active")
      return res.status(403).json({ message: "Account is not active" });
    if (!user.isEmailVerified)
      return res.status(403).json({
        message: "Please verify your email before logging in",
        needsVerification: true,
      });

    generateToken(res, user._id, user.role);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isEmailVerified)
      return res.status(400).json({ message: "Email already verified" });

    if (!user.otp || !user.otpExpiry)
      return res.status(400).json({ message: "No OTP requested. Contact admin." });

    if (user.otpExpiry < new Date())
      return res.status(400).json({ message: "OTP expired. Contact admin to resend." });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isEmailVerified)
      return res.status(400).json({ message: "Email already verified" });

    if (user.status !== "active")
      return res.status(403).json({ message: "Account not yet approved by admin" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendOtpEmail(user, otp); // fire-and-forget

    res.json({ message: "A new OTP has been sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const logoutUser = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    expires: new Date(0),
  });
  res.json({ message: "Logged out" });
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { registerUser, loginUser, logoutUser, getMe, verifyOtp , resendOtp };