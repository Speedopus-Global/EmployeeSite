const Attendance = require("../models/attendance");

const ATTENDANCE_TIMEZONE = process.env.ATTENDANCE_TIMEZONE || "Asia/Kolkata";

const getTodayDateString = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ATTENDANCE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const dateParts = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value])
  );

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

const calculateBreakMs = (breaks = [], currentEndTime = null) => {
  return breaks.reduce((total, b) => {
    const start = new Date(b.startTime).getTime();
    const end = b.endTime ? new Date(b.endTime).getTime() : currentEndTime ? new Date(currentEndTime).getTime() : start;
    return total + Math.max(0, end - start);
  }, 0);
};

const toSeconds = (milliseconds) => Math.max(0, Math.round(milliseconds / 1000));

const setDurationFields = (record, totalBreakMs, workingMs = null) => {
  const totalBreakSeconds = toSeconds(totalBreakMs);
  record.totalBreakSeconds = totalBreakSeconds;
  record.totalBreakHours = totalBreakSeconds / 3600;

  if (workingMs !== null) {
    const workingSeconds = toSeconds(workingMs);
    record.workingSeconds = workingSeconds;
    record.workingHours = workingSeconds / 3600;
  }
};

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
        isPaused: false,
        breaks: [],
      });
    }
    // if record already exists for today, we don't overwrite loginTime again

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/attendance/pause
const pauseAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const date = getTodayDateString();

    const record = await Attendance.findOne({ employee: employeeId, date });
    if (!record || !record.loginTime)
      return res.status(400).json({ message: "No login record found for today" });

    if (record.logoutTime)
      return res.status(400).json({ message: "Already logged out for today" });

    if (record.isPaused)
      return res.status(400).json({ message: "Attendance is already paused" });

    record.isPaused = true;
    if (!record.breaks) record.breaks = [];
    record.breaks.push({ startTime: new Date() });

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/attendance/resume
const resumeAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const date = getTodayDateString();

    const record = await Attendance.findOne({ employee: employeeId, date });
    if (!record || !record.loginTime)
      return res.status(400).json({ message: "No login record found for today" });

    if (record.logoutTime)
      return res.status(400).json({ message: "Already logged out for today" });

    if (!record.isPaused)
      return res.status(400).json({ message: "Attendance is not paused" });

    if (record.breaks && record.breaks.length > 0) {
      const lastBreak = record.breaks[record.breaks.length - 1];
      if (!lastBreak.endTime) {
        lastBreak.endTime = new Date();
      }
    }

    record.isPaused = false;
    const totalBreakMs = calculateBreakMs(record.breaks);
    setDurationFields(record, totalBreakMs);

    await record.save();
    res.json(record);
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

    const now = new Date();

    if (record.isPaused && record.breaks && record.breaks.length > 0) {
      const lastBreak = record.breaks[record.breaks.length - 1];
      if (!lastBreak.endTime) {
        lastBreak.endTime = now;
      }
      record.isPaused = false;
    }

    record.logoutTime = now;
    const totalBreakMs = calculateBreakMs(record.breaks);
    const grossMs = Math.max(0, record.logoutTime.getTime() - new Date(record.loginTime).getTime());
    const netMs = Math.max(0, grossMs - totalBreakMs);

    setDurationFields(record, totalBreakMs, netMs);

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

module.exports = {
  markLogin,
  markLogout,
  pauseAttendance,
  resumeAttendance,
  getMyAttendance,
  getMyTodayAttendance,
  getAllAttendance,
};