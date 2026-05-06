const Rental = require("../models/Rental");
const Item = require("../models/Item");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

// Request rental
exports.requestRental = async (req, res) => {
  try {
    const { item_id, start_date, end_date } = req.body;
    const item = await Item.findById(item_id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (!start_date || !end_date || new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ error: "Please select a valid rental date range" });
    }

    if (String(item.owner) === req.user.id) {
      return res.status(400).json({ error: "You cannot rent your own item" });
    }

    const existingRental = await Rental.findOne({
      item_id,
      renter_id: req.user.id,
      rental_status: { $in: ["pending", "approved", "active"] },
      payment_status: { $in: ["pending", "paid"] }
    });

    if (existingRental) {
      return res.status(409).json({ error: "You already have a rental request for this item" });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const rentalDays = Math.max(Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1, 1);

    const rental = new Rental({
      order_id: uuidv4(),
      item_id,
      owner_id: item.owner,
      renter_id: req.user.id,
      start_date,
      end_date,
      rent_price: item.pricePerDay * rentalDays,
      deposit_amount: item.depositAmount || 0
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

    if (String(rental.owner_id) !== req.user.id) {
      return res.status(403).json({ error: "Only the owner can approve this rental" });
    }

    rental.rental_status = "approved";
    await rental.save();
    res.json({ message: "Rental approved", rental });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({
      $or: [{ renter_id: req.user.id }, { owner_id: req.user.id }]
    })
      .populate("item_id")
      .populate("owner_id", "name email")
      .populate("renter_id", "name email")
      .sort({ createdAt: -1 });

    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    if (String(rental.renter_id) !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own rental request" });
    }

    if (rental.payment_status !== "pending" || rental.rental_status !== "pending") {
      return res.status(400).json({ error: "Only pending rental requests can be deleted" });
    }

    await rental.deleteOne();
    res.json({ message: "Rental request deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate OTP for return
exports.generateReturnOTP = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    if (String(rental.renter_id) !== req.user.id) {
      return res.status(403).json({ error: "Only the renter can start the return process" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    rental.return_otp = otp;
    rental.otp_expiry = new Date(Date.now() + 10 * 60000); // 10 min expiry
    await rental.save();

    const owner = await User.findById(rental.owner_id);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: owner?.email || process.env.EMAIL_USER,
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
