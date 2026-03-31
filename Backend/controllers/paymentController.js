const Payment = require("../models/Payment");
const Rental = require("../models/Rental");
const { v4: uuidv4 } = require("uuid");

// Simulate payment gateway
exports.initiatePayment = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    const transactionId = uuidv4();
    const payment = new Payment({
      rental_id: rental._id,
      renter_id: rental.renter_id,
      owner_id: rental.owner_id,
      amount: rental.rent_price,
      deposit: rental.deposit_amount,
      transaction_id: transactionId,
      status: "paid"
    });

    rental.payment_status = "paid";
    rental.transaction_id = transactionId;
    rental.rental_status = "active";

    await payment.save();
    await rental.save();

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

    const payment = await Payment.findOne({ rental_id: rental._id });
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
    const payment = await Payment.findOne({ rental_id: rental._id });

    payment.status = "deducted";
    payment.deposit = payment.deposit - deduction_amount;
    rental.refund_status = "deducted";

    await payment.save();
    await rental.save();

    res.json({ message: "Deposit deducted for damage", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
