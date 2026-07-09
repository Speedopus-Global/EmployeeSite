const mongoose = require("mongoose");

const drawingSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    drawingNumber: {
      type: String,
      required: true,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    // Cloudinary File Details
    originalName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    // Approval Details
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewRemarks: {
      type: String,
      trim: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Drawing", drawingSchema);