const express = require("express");
const {
  createLeave,
  getMyLeaves,
  getAllLeaves,
  decideLeave,
} = require("../controllers/leaveController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.post("/", createLeave);
router.get("/me", getMyLeaves);
router.get("/", adminOnly, getAllLeaves);
router.put("/:id/decision", adminOnly, decideLeave);

module.exports = router;
