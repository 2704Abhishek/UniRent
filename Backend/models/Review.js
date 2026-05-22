const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
  reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rental_id: { type: mongoose.Schema.Types.ObjectId, ref: "Rental" },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  rating: { type: Number, required: true },
  comment: String,
  review_type: { type: String, enum: ["owner", "renter", "general"], default: "general" },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Review', reviewSchema);
