const express = require("express");
const {
  uploadDrawing,
  getMyDrawings,
  getAllDrawings,
  approveDrawing,
  rejectDrawing,
  downloadDrawing,
  viewDrawing,
} = require("../controllers/drawingController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/", protect, upload.single("file"), uploadDrawing);
router.get("/me", protect, getMyDrawings);
router.get("/", protect, adminOnly, getAllDrawings);
router.put("/:id/approve", protect, adminOnly, approveDrawing);
router.put("/:id/reject", protect, adminOnly, rejectDrawing);
router.get("/:id/download", protect, downloadDrawing);
router.get("/:id/view", protect, viewDrawing);

module.exports = router;