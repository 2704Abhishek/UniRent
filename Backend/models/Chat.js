const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
  rental_id: { type: mongoose.Schema.Types.ObjectId, ref: "Rental", required: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Chat', chatSchema);
