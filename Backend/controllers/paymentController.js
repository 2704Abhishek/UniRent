const Payment = require("../models/Payment");
const Rental = require("../models/Rental");
const Item = require("../models/Item");
const { v4: uuidv4 } = require("uuid");

// Simulate payment gateway
exports.initiatePayment = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate("item_id");
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    if (String(rental.renter_id) !== req.user.id) {
      return res.status(403).json({ error: "Only the renter can pay for this rental" });
    }

    if (rental.payment_status !== "pending") {
      return res.status(400).json({ error: "This rental has already been paid" });
    }

    if (!rental.item_id?.available) {
      return res.status(409).json({ error: "This item is already on rent" });
    }

    const activeItemRental = await Rental.findOne({
      _id: { $ne: rental._id },
      item_id: rental.item_id._id,
      rental_status: { $in: ["approved", "active"] }
    });

    if (activeItemRental) {
      return res.status(409).json({ error: "This item is already on rent" });
    }

    const transactionId = uuidv4();
    const start = new Date(rental.start_date);
    const end = new Date(rental.end_date);
    const rentalDays = Math.max(Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1, 1);
    const dailyRent = Number(rental.item_id?.pricePerDay || 0);
    const savedRent = Number(rental.rent_price || 0);
    const rentAmount = savedRent === dailyRent && rentalDays > 1 ? dailyRent * rentalDays : savedRent;
    const depositAmount = Number(rental.deposit_amount || 0);

    const payment = new Payment({
      rental_id: rental._id,
      renter_id: rental.renter_id,
      owner_id: rental.owner_id,
      amount: rentAmount + depositAmount,
      deposit: depositAmount,
      transaction_id: transactionId,
      status: "paid"
    });

    rental.payment_status = "paid";
    rental.transaction_id = transactionId;
    rental.rental_status = "active";

    await payment.save();
    await rental.save();
    await Item.findByIdAndUpdate(rental.item_id._id, { available: false });

    res.json({ message: "Payment successful", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Refund deposit after return
exports.refundDeposit = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    if (String(rental.owner_id) !== req.user.id) {
      return res.status(403).json({ error: "Only the owner can refund this deposit" });
    }

    if (rental.rental_status !== "returned" || rental.refund_status !== "pending") {
      return res.status(400).json({ error: "Only pending returned rentals can be refunded" });
    }

    const payment = await Payment.findOne({ rental_id: rental._id });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    payment.status = "refunded";
    rental.refund_status = "refunded";
    await payment.save();
    await rental.save();

    res.json({ message: "Deposit refunded", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deduct deposit for damage
exports.deductDeposit = async (req, res) => {
  try {
    const { deduction_amount } = req.body;
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    if (String(rental.owner_id) !== req.user.id) {
      return res.status(403).json({ error: "Only the owner can deduct from this deposit" });
    }

    if (rental.rental_status !== "returned" || rental.refund_status !== "pending") {
      return res.status(400).json({ error: "Only pending returned rentals can be deducted" });
    }

    const payment = await Payment.findOne({ rental_id: rental._id });
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    payment.status = "deducted";
    payment.deposit = Math.max(0, payment.deposit - deduction_amount);
    rental.refund_status = "deducted";

    await payment.save();
    await rental.save();

    res.json({ message: "Deposit deducted for damage", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
