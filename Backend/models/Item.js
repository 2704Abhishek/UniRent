const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  condition: { type: String, default: "Good" },
  brandModel: { type: String, default: "" },
  accessories: { type: String, default: "" },
  contactPhone: { type: String, default: "" },
  address: { type: String },
  pickupInstructions: { type: String, default: "" },
  pricePerDay: { type: Number, required: true },
  depositAmount: { type: Number, default: 0 },
  lateReturnFee: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);
