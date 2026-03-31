const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  rental_id: { type: mongoose.Schema.Types.ObjectId, ref: "Rental" },
  renter_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  deposit: Number,
  transaction_id: String,
  status: { type: String, enum: ["initiated", "paid", "refunded", "deducted"], default: "initiated" }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
