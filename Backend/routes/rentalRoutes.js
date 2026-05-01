const express = require("express");
const router = express.Router();
const {
  requestRental,
  approveRental,
  deleteRental,
  generateReturnOTP,
  verifyReturnOTP,
  getMyRentals
} = require("../controllers/rentalController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/my", authMiddleware, getMyRentals);
router.post("/", authMiddleware, requestRental);
router.post("/:id/approve", authMiddleware, approveRental);
router.post("/:id/return", authMiddleware, generateReturnOTP);
router.post("/:id/verify-return", authMiddleware, verifyReturnOTP);
router.delete("/:id", authMiddleware, deleteRental);

module.exports = router;
