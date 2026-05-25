const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  rental_id: { type: mongoose.Schema.Types.ObjectId, ref: "Rental" },
  renter_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  deposit: Number,
  currency: { type: String, default: "INR" },
  transaction_id: String,
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  razorpay_refund_id: String,
  razorpay_refund_status: String,
  razorpay_refund_reference: String,
  refund_amount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["initiated", "paid", "refund_processing", "refund_failed", "refunded", "deducted"],
    default: "initiated"
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
