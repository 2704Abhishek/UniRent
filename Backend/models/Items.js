const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  category: String,
  price_per_day: Number,
  deposit_amount: Number,
  location: String,
  availability: [Date],
  image_urls: [String]
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);
