const express = require("express");
const router = express.Router();
const { requestRental, approveRental, generateReturnOTP, verifyReturnOTP } = require("../controllers/rentalController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, requestRental);
router.post("/:id/approve", authMiddleware, approveRental);
router.post("/:id/return", authMiddleware, generateReturnOTP);
router.post("/:id/verify-return", authMiddleware, verifyReturnOTP);

module.exports = router;
