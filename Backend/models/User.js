const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: "" },
  password: { type: String, required: true },
  university_verified: { type: Boolean, default: false },
  otp: { type: Number, default: null },   // ✅ OTP field for email verification
  trust_score: { type: Number, default: 50 },
  rating: { type: Number, default: 0 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  profile_photo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

