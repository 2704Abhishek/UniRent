const express = require("express");
const router = express.Router();
const { initiatePayment, refundDeposit, deductDeposit } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:id/initiate", authMiddleware, initiatePayment);
router.post("/:id/refund", authMiddleware, refundDeposit);
router.post("/:id/deduct", authMiddleware, deductDeposit);

module.exports = router;
