const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone: phone?.trim() || "",
      password: hashedPassword
    });
    await user.save();

    // Send OTP via email
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "UniRent Email Verification",
      text: `Your OTP is ${otp}`
    });

    res.json({ message: "Signup successful, OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT secret is not configured" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: "1d" });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        trust_score: user.trust_score,
        university_verified: user.university_verified
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
