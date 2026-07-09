const Attendance = require("../models/attendance");

const getTodayDateString = () => new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

// @route POST /api/attendance/login   (called right after user logs in)
const markLogin = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const date = getTodayDateString();

    let record = await Attendance.findOne({ employee: employeeId, date });

    if (!record) {
      record = await Attendance.create({
        employee: employeeId,
        date,
        loginTime: new Date(),
      });
    }
    // if record already exists for today, we don't overwrite loginTime again

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/attendance/logout

const markLogout = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const date = getTodayDateString();

    const record = await Attendance.findOne({ employee: employeeId, date });
    if (!record || !record.loginTime)
      return res.status(400).json({ message: "No login record found for today" });

    if (record.logoutTime)
      return res.status(400).json({ message: "Already logged out for today" });

    record.logoutTime = new Date();
    const hours = (record.logoutTime - record.loginTime) / (1000 * 60 * 60);
    record.workingHours = Math.round(hours * 100) / 100;

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/attendance/me   (employee's own history)
const getMyAttendance = async (req, res) => {
  const records = await Attendance.find({ employee: req.user._id }).sort({ date: -1 });
  res.json(records);
};

// @route GET /api/attendance/today   (employee's own today record, for dashboard)
const getMyTodayAttendance = async (req, res) => {
  const record = await Attendance.findOne({
    employee: req.user._id,
    date: getTodayDateString(),
  });
  res.json(record || null);
};

// @route GET /api/attendance/all   (admin only — monitor everyone)
const getAllAttendance = async (req, res) => {
  const records = await Attendance.find()
    .populate("employee", "name email")
    .sort({ date: -1 });
  res.json(records);
};

module.exports = { markLogin, markLogout, getMyAttendance, getMyTodayAttendance, getAllAttendance };