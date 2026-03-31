const mongoose = require("mongoose");

const damageReportSchema = new mongoose.Schema({
  rental_id: { type: mongoose.Schema.Types.ObjectId, ref: "Rental" },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  renter_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  photos: [String],
  description: String,
  status: { type: String, enum: ["pending", "reviewed", "deducted"], default: "pending" },
  deduction_amount: Number
}, { timestamps: true });

module.exports = mongoose.model("DamageReport", damageReportSchema);
