
const User = require("../models/User");

// @route GET /api/employees        (all employees, admin only)
const getEmployees = async (req, res) => {
  const employees = await User.find({ role: "employee" }).select("-password");
  res.json(employees);
};

// @route GET /api/employees/pending
const getPendingEmployees = async (req, res) => {
  const pending = await User.find({ role: "employee", status: "pending" }).select("-password");
  res.json(pending);
};

// @route PUT /api/employees/:id/approve
const approveEmployee = async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  employee.status = "active";
  await employee.save();
  res.json({ message: "Employee approved", employee });
};

// @route PUT /api/employees/:id/reject
const rejectEmployee = async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  employee.status = "rejected";
  await employee.save();
  res.json({ message: "Employee rejected", employee });
};

// @route PUT /api/employees/:id/deactivate
const deactivateEmployee = async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  employee.status = "deactivated";
  await employee.save();
  res.json({ message: "Employee deactivated", employee });
};

// @route PUT /api/employees/:id/activate
const activateEmployee = async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  employee.status = "active";
  await employee.save();
  res.json({ message: "Employee activated", employee });
};

module.exports = {
  getEmployees,
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
  deactivateEmployee,
  activateEmployee,
};