const express = require("express");
const {
  getEmployees,
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
  deactivateEmployee,
  activateEmployee,
} = require("../controllers/employeeController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect, adminOnly); // every route below requires an active admin

router.get("/", getEmployees);
router.get("/pending", getPendingEmployees);
router.put("/:id/approve", approveEmployee);
router.put("/:id/reject", rejectEmployee);
router.put("/:id/deactivate", deactivateEmployee);
router.put("/:id/activate", activateEmployee);

module.exports = router;