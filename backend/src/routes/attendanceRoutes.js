const express = require("express");
const {
  markLogin,
  markLogout,
  getMyAttendance,
  getMyTodayAttendance,
  getAllAttendance,
} = require("../controllers/attendanceController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post("/login", protect, markLogin);
router.post("/logout", protect, markLogout);
router.get("/me", protect, getMyAttendance);
router.get("/today", protect, getMyTodayAttendance);
router.get("/all", protect, adminOnly, getAllAttendance);

module.exports = router;