const Leave = require("../models/leave");
const User = require("../models/user");
const {
  sendAdminLeaveRequestAlert,
  sendEmployeeLeaveDecision,
} = require("../utils/emailService");

const parseDate = (value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const createLeave = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ message: "Only employees can submit leave requests" });
    }

    const { leaveType, startDate, endDate, reason } = req.body;
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const today = parseDate(new Date().toISOString().slice(0, 10));

    if (!leaveType || !start || !end || !reason?.trim()) {
      return res.status(400).json({ message: "Leave type, dates, and reason are required" });
    }
    if (end < start) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }
    if (start < today) {
      return res.status(400).json({ message: "Leave cannot start in the past" });
    }

    const overlapping = await Leave.findOne({
      employee: req.user._id,
      status: { $in: ["pending", "approved"] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });
    if (overlapping) {
      return res.status(409).json({ message: "You already have an overlapping leave request" });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason.trim(),
    });

    const employee = await User.findById(req.user._id).select("name email");
    sendAdminLeaveRequestAlert(leave, employee);
    res.status(201).json(await leave.populate("employee", "name email"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyLeaves = async (req, res) => {
  const leaves = await Leave.find({ employee: req.user._id })
    .populate("reviewedBy", "name")
    .sort({ createdAt: -1 });
  res.json(leaves);
};

const getAllLeaves = async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const leaves = await Leave.find(filter)
    .populate("employee", "name email")
    .populate("reviewedBy", "name")
    .sort({ createdAt: -1 });
  res.json(leaves);
};

const decideLeave = async (req, res) => {
  try {
    const { status, remarks = "" } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Decision must be approved or rejected" });
    }

    const leave = await Leave.findById(req.params.id).populate("employee", "name email");
    if (!leave) return res.status(404).json({ message: "Leave request not found" });
    if (leave.status !== "pending") {
      return res.status(409).json({ message: "This leave request has already been decided" });
    }

    leave.status = status;
    leave.adminRemarks = remarks.trim();
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    sendEmployeeLeaveDecision(leave, leave.employee);
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createLeave, getMyLeaves, getAllLeaves, decideLeave };
