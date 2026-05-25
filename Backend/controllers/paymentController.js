const Payment = require("../models/Payment");
const Rental = require("../models/Rental");
const Item = require("../models/Item");
const User = require("../models/User");
const crypto = require("crypto");
const https = require("https");

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured");
  }

  return {
    keyId,
    keySecret,
    currency: process.env.RAZORPAY_CURRENCY || "INR"
  };
};

const callRazorpay = (path, payload, method = "POST") =>
  new Promise((resolve, reject) => {
    const { keyId, keySecret } = getRazorpayConfig();
    const body = payload ? JSON.stringify(payload) : "";
    const headers = {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`
    };

    if (body) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(body);
    }

    const request = https.request(
      {
        hostname: "api.razorpay.com",
        path,
        method,
        headers
      },
      (response) => {
        let responseBody = "";

        response.on("data", (chunk) => {
          responseBody += chunk;
        });

        response.on("end", () => {
          let data = {};
          try {
            data = responseBody ? JSON.parse(responseBody) : {};
          } catch (error) {
            reject(new Error("Razorpay returned an invalid response"));
            return;
          }

          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(data);
            return;
          }
          reject(new Error(data.error?.description || data.error || "Razorpay request failed"));
        });
      }
    );

    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });

const getRefundReference = (refund) => {
  const data = refund?.acquirer_data;
  if (!data || typeof data !== "object") return "";

  return ["rrn", "arn", "utr", "bank_transaction_id"]
    .map((key) => data[key])
    .find(Boolean) || "";
};

const applyRefundState = async ({ rental, payment, refund, refundAmount }) => {
  const refundStatus = refund?.status || "pending";
  const refundReference = getRefundReference(refund);

  payment.razorpay_refund_id = refund.id;
  payment.razorpay_refund_status = refundStatus;
  payment.razorpay_refund_reference = refundReference;
  payment.refund_amount = refundAmount;

  rental.razorpay_refund_id = refund.id;
  rental.refund_processor_status = refundStatus;
  rental.refund_reference = refundReference;

  if (refundStatus === "processed") {
    payment.status = "refunded";
    rental.refund_status = "refunded";
    rental.rental_status = "refunded";
  } else if (refundStatus === "failed") {
    payment.status = "refund_failed";
    rental.refund_status = "failed";
    rental.rental_status = "returned";
  } else {
    payment.status = "refund_processing";
    rental.refund_status = "processing";
    rental.rental_status = "returned";
  }

  await payment.save();
  await rental.save();
};

const getRentalPaymentDetails = (rental) => {
  const start = new Date(rental.start_date);
  const end = new Date(rental.end_date);
  const rentalDays = Math.max(Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1, 1);
  const dailyRent = Number(rental.item_id?.pricePerDay || 0);
  const savedRent = Number(rental.rent_price || 0);
  const rentAmount = savedRent === dailyRent && rentalDays > 1 ? dailyRent * rentalDays : savedRent;
  const depositAmount = Number(rental.deposit_amount || 0);
  const totalAmount = rentAmount + depositAmount;

  return { rentAmount, depositAmount, totalAmount };
};

const ensureRentalCanBePaid = async (rental, userId) => {
  if (!rental) return { status: 404, error: "Rental not found" };

  if (String(rental.renter_id) !== userId) {
    return { status: 403, error: "Only the renter can pay for this rental" };
  }

  if (rental.payment_status !== "pending") {
    return { status: 400, error: "This rental has already been paid" };
  }

  if (!rental.item_id?.available) {
    return { status: 409, error: "This item is already on rent" };
  }

  const activeItemRental = await Rental.findOne({
    _id: { $ne: rental._id },
    item_id: rental.item_id._id,
    rental_status: { $in: ["approved", "active"] }
  });

  if (activeItemRental) {
    return { status: 409, error: "This item is already on rent" };
  }

  return null;
};

exports.initiatePayment = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate("item_id");
    const validationError = await ensureRentalCanBePaid(rental, req.user.id);
    if (validationError) return res.status(validationError.status).json({ error: validationError.error });

    const { keyId, currency } = getRazorpayConfig();
    const { depositAmount, totalAmount } = getRentalPaymentDetails(rental);
    if (totalAmount <= 0) {
      return res.status(400).json({ error: "Payment amount must be greater than zero" });
    }

    const order = await callRazorpay("/v1/orders", {
      amount: Math.round(totalAmount * 100),
      currency,
      receipt: `rental_${rental._id}`,
      notes: {
        rental_id: String(rental._id),
        renter_id: String(rental.renter_id),
        owner_id: String(rental.owner_id)
      }
    });

    const payment = await Payment.findOneAndUpdate(
      { rental_id: rental._id, status: "initiated" },
      {
        rental_id: rental._id,
        renter_id: rental.renter_id,
        owner_id: rental.owner_id,
        amount: totalAmount,
        deposit: depositAmount,
        currency,
        transaction_id: order.id,
        razorpay_order_id: order.id,
        status: "initiated"
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const renter = await User.findById(rental.renter_id).select("name email phone");
    const renterPhone = renter?.phone ? String(renter.phone).trim() : "";

    res.json({
      key: keyId,
      name: "UniRent",
      description: `Rental payment for ${rental.item_id?.title || "item"}`,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      prefill: {
        name: renter?.name || "",
        email: renter?.email || "",
        ...(renterPhone ? { contact: renterPhone.startsWith("+") ? renterPhone : `+91${renterPhone}` } : {})
      },
      payment_id: payment._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing Razorpay payment verification details" });
    }

    const rental = await Rental.findById(req.params.id).populate("item_id");
    const validationError = await ensureRentalCanBePaid(rental, req.user.id);
    if (validationError) return res.status(validationError.status).json({ error: validationError.error });

    const payment = await Payment.findOne({
      rental_id: rental._id,
      razorpay_order_id,
      status: "initiated"
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment order not found" });
    }

    const { keySecret } = getRazorpayConfig();
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${payment.razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const receivedSignature = String(razorpay_signature);

    const isValidSignature =
      expectedSignature.length === receivedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(receivedSignature));

    if (!isValidSignature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    payment.status = "paid";
    payment.transaction_id = razorpay_payment_id;
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = receivedSignature;

    rental.payment_status = "paid";
    rental.transaction_id = razorpay_payment_id;
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

    if (rental.rental_status !== "returned" || !["pending", "failed"].includes(rental.refund_status)) {
      return res.status(400).json({ error: "Only pending returned rentals can be refunded" });
    }

    const payment = await Payment.findOne({ rental_id: rental._id });
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    if (!["paid", "refund_failed"].includes(payment.status)) {
      return res.status(400).json({ error: "Only paid rentals can be refunded" });
    }

    const refundAmount = Number(payment.deposit || rental.deposit_amount || 0);
    if (refundAmount <= 0) {
      return res.status(400).json({ error: "No deposit amount is available to refund" });
    }

    if (!payment.razorpay_payment_id) {
      return res.status(400).json({ error: "Razorpay payment id is missing for this rental" });
    }

    const refund = await callRazorpay(`/v1/payments/${encodeURIComponent(payment.razorpay_payment_id)}/refund`, {
      amount: Math.round(refundAmount * 100),
      speed: process.env.RAZORPAY_REFUND_SPEED || "normal",
      receipt: `deposit_refund_${rental._id}`,
      notes: {
        rental_id: String(rental._id),
        renter_id: String(rental.renter_id),
        owner_id: String(rental.owner_id),
        refund_type: "deposit"
      }
    });

    await applyRefundState({ rental, payment, refund, refundAmount });

    res.json({ message: "Deposit refund initiated", payment, refund });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRefundStatus = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    const isParticipant = [rental.owner_id, rental.renter_id].some(
      (participantId) => String(participantId) === String(req.user.id)
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "You can only check refunds for your own rentals" });
    }

    const payment = await Payment.findOne({ rental_id: rental._id });
    if (!payment?.razorpay_refund_id) {
      return res.status(404).json({ error: "Refund has not been initiated yet" });
    }

    const refund = await callRazorpay(`/v1/refunds/${encodeURIComponent(payment.razorpay_refund_id)}`, null, "GET");
    await applyRefundState({
      rental,
      payment,
      refund,
      refundAmount: Number(payment.refund_amount || payment.deposit || rental.deposit_amount || 0)
    });

    res.json({ message: "Refund status updated", refund, rental });
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
