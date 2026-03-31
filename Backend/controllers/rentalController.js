const Rental = require("../models/Rental");
const Item = require("../models/Item");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

// Request rental
exports.requestRental = async (req, res) => {
  try {
    const { item_id, start_date, end_date } = req.body;
    const item = await Item.findById(item_id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const rental = new Rental({
      order_id: uuidv4(),
      item_id,
      owner_id: item.owner_id,
      renter_id: req.user.id,
      start_date,
      end_date,
      rent_price: item.price_per_day,
      deposit_amount: item.deposit_amount
    });

    await rental.save();
    res.json({ message: "Rental request created", rental });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve rental
exports.approveRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    rental.rental_status = "approved";
    await rental.save();
    res.json({ message: "Rental approved", rental });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate OTP for return
exports.generateReturnOTP = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    rental.return_otp = otp;
    rental.otp_expiry = new Date(Date.now() + 10 * 60000); // 10 min expiry
    await rental.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "owner_email@example.com", // Replace with actual owner email
      subject: "UniRent Return OTP",
      text: `Your OTP for item return is ${otp}`
    });

    res.json({ message: "OTP generated and sent to owner" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify return OTP
exports.verifyReturnOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    if (rental.return_otp !== otp || new Date() > rental.otp_expiry) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    rental.rental_status = "returned";
    rental.refund_status = "refunded";
    await rental.save();

    res.json({ message: "Item return confirmed, deposit refunded", rental });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
