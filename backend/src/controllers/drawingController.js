const Drawing = require("../models/Drawing");
const fs = require("fs");
const path = require("path");

// @route POST /api/drawings   (employee uploads)
const uploadDrawing = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { projectName, drawingNumber, remarks } = req.body;
    if (!projectName || !drawingNumber) {
      fs.unlinkSync(req.file.path); // clean up orphaned file
      return res.status(400).json({ message: "Project name and drawing number are required" });
    }

    const drawing = await Drawing.create({
      employee: req.user._id,
      projectName,
      drawingNumber,
      remarks,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      filePath: req.file.path,
    });

    res.status(201).json(drawing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/drawings/me   (employee's own uploads)
const getMyDrawings = async (req, res) => {
  const drawings = await Drawing.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.json(drawings);
};

// @route GET /api/drawings   (admin — all drawings, optional ?status=pending filter)
const getAllDrawings = async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const drawings = await Drawing.find(filter)
    .populate("employee", "name email")
    .sort({ createdAt: -1 });
  res.json(drawings);
};

// @route PUT /api/drawings/:id/approve   (admin)
const approveDrawing = async (req, res) => {
  const drawing = await Drawing.findById(req.params.id);
  if (!drawing) return res.status(404).json({ message: "Drawing not found" });

  drawing.status = "approved";
  drawing.reviewRemarks = req.body.remarks || "";
  drawing.reviewedBy = req.user._id;
  drawing.reviewedAt = new Date();
  await drawing.save();

  res.json(drawing);
};

// @route PUT /api/drawings/:id/reject   (admin)
const rejectDrawing = async (req, res) => {
  const drawing = await Drawing.findById(req.params.id);
  if (!drawing) return res.status(404).json({ message: "Drawing not found" });

  drawing.status = "rejected";
  drawing.reviewRemarks = req.body.remarks || "";
  drawing.reviewedBy = req.user._id;
  drawing.reviewedAt = new Date();
  await drawing.save();

  res.json(drawing);
};

// @route GET /api/drawings/:id/download
const downloadDrawing = async (req, res) => {
  const drawing = await Drawing.findById(req.params.id);
  if (!drawing) return res.status(404).json({ message: "Drawing not found" });

  // employees can only download their own; admin can download any
  if (req.user.role !== "admin" && drawing.employee.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not authorized to access this file" });

  res.download(path.resolve(drawing.filePath), drawing.originalName);
};

module.exports = {
  uploadDrawing,
  getMyDrawings,
  getAllDrawings,
  approveDrawing,
  rejectDrawing,
  downloadDrawing,
};