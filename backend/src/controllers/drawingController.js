const Drawing = require("../models/Drawing");

// @route POST /api/drawings
// @desc Employee uploads a drawing
const uploadDrawing = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { projectName, drawingNumber, remarks } = req.body;

    if (!projectName || !drawingNumber) {
      return res.status(400).json({
        message: "Project name and drawing number are required",
      });
    }

    const drawing = await Drawing.create({
      employee: req.user._id,
      projectName,
      drawingNumber,
      remarks,

      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,

      // Cloudinary Details
      fileUrl: req.file.path,
      publicId: req.file.filename,
    });

    res.status(201).json(drawing);
  } catch (err) {
   console.error("Upload error:", err.message);
  res.status(500).json({ message: err.message || "Upload failed" });
}
};

// @route GET /api/drawings/me
// @desc Employee's own uploads
const getMyDrawings = async (req, res) => {
  try {
    const drawings = await Drawing.find({
      employee: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(drawings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/drawings
// @desc Admin - All drawings
const getAllDrawings = async (req, res) => {
  try {
    const filter = req.query.status
      ? { status: req.query.status }
      : {};

    const drawings = await Drawing.find(filter)
      .populate("employee", "name email")
      .sort({ createdAt: -1 });

    res.json(drawings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/drawings/:id/approve
// @desc Admin approves drawing
const approveDrawing = async (req, res) => {
  try {
    const drawing = await Drawing.findById(req.params.id);

    if (!drawing) {
      return res.status(404).json({ message: "Drawing not found" });
    }

    drawing.status = "approved";
    drawing.reviewRemarks = req.body.remarks || "";
    drawing.reviewedBy = req.user._id;
    drawing.reviewedAt = new Date();

    await drawing.save();

    res.json(drawing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/drawings/:id/reject
// @desc Admin rejects drawing
const rejectDrawing = async (req, res) => {
  try {
    const drawing = await Drawing.findById(req.params.id);

    if (!drawing) {
      return res.status(404).json({ message: "Drawing not found" });
    }

    drawing.status = "rejected";
    drawing.reviewRemarks = req.body.remarks || "";
    drawing.reviewedBy = req.user._id;
    drawing.reviewedAt = new Date();

    await drawing.save();

    res.json(drawing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/drawings/:id/download
// @desc Download drawing
const downloadDrawing = async (req, res) => {
  try {
    const drawing = await Drawing.findById(req.params.id);

    if (!drawing) {
      return res.status(404).json({ message: "Drawing not found" });
    }

    if (
      req.user.role !== "admin" &&
      drawing.employee.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this file" });
    }

    return res.redirect(drawing.fileUrl);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/drawings/:id/view
// @desc View drawing
const viewDrawing = async (req, res) => {
  try {
    const drawing = await Drawing.findById(req.params.id);

    if (!drawing) {
      return res.status(404).json({ message: "Drawing not found" });
    }

    if (
      req.user.role !== "admin" &&
      drawing.employee.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this file" });
    }

    return res.redirect(drawing.fileUrl);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  uploadDrawing,
  getMyDrawings,
  getAllDrawings,
  approveDrawing,
  rejectDrawing,
  downloadDrawing,
  viewDrawing,
};