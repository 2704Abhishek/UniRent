const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  address: { type: String },
  pricePerDay: { type: Number, required: true },
  depositAmount: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);
