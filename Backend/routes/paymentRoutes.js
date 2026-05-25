const express = require("express");
const router = express.Router();
const { initiatePayment, verifyPayment, refundDeposit, getRefundStatus, deductDeposit } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:id/initiate", authMiddleware, initiatePayment);
router.post("/:id/verify", authMiddleware, verifyPayment);
router.post("/:id/refund", authMiddleware, refundDeposit);
router.get("/:id/refund-status", authMiddleware, getRefundStatus);
router.post("/:id/deduct", authMiddleware, deductDeposit);

module.exports = router;
