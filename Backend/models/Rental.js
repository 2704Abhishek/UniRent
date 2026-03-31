const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  order_id: { type: String, unique: true },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  renter_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  start_date: Date,
  end_date: Date,
  rent_price: Number,
  deposit_amount: Number,
  payment_status: { type: String, enum: ["pending", "paid"], default: "pending" },
  rental_status: { type: String, enum: ["pending", "approved", "active", "returned", "refunded"], default: "pending" },
  return_otp: String,
  otp_expiry: Date,
  refund_status: { type: String, enum: ["pending", "refunded", "deducted"], default: "pending" },
  transaction_id: String
}, { timestamps: true });

module.exports = mongoose.model("Rental", rentalSchema);
