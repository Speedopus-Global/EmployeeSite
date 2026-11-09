const mongoose = require("mongoose");

const breakSchema = new mongoose.Schema(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD", one record per employee per day
    loginTime: { type: Date },
    logoutTime: { type: Date },
    isPaused: { type: Boolean, default: false },
    breaks: [breakSchema],
    totalBreakSeconds: { type: Number, default: 0, min: 0 },
    totalBreakHours: { type: Number, default: 0 },
    workingSeconds: { type: Number, default: 0, min: 0 },
    workingHours: { type: Number, default: 0 }, // in hours, calculated on logout
  },
  { timestamps: true }
);

// One attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);