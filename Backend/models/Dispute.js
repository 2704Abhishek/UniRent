const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema({
  rental_id: { type: mongoose.Schema.Types.ObjectId, ref: "Rental" },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  renter_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: String,
  status: { type: String, enum: ["open", "resolved", "rejected"], default: "open" },
  resolution: String
}, { timestamps: true });

module.exports = mongoose.model("Dispute", disputeSchema);
