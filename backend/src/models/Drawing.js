const mongoose = require("mongoose");

const drawingSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectName: { type: String, required: true, trim: true },
    drawingNumber: { type: String, required: true, trim: true },
    remarks: { type: String, trim: true },
    fileName: { type: String, required: true },       // stored filename on disk
    originalName: { type: String, required: true },   // original upload name
    fileType: { type: String, required: true },        // mimetype
    filePath: { type: String, required: true },        // relative path for retrieval
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewRemarks: { type: String, trim: true },        // admin's comment on approve/reject
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Drawing", drawingSchema);