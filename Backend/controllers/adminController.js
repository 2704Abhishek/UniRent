const User = require("../models/User");
const Item = require("../models/Item");
const Review = require("../models/Review");
const Dispute = require("../models/Dispute");

const DamageReport = require("../models/DamageReport");

exports.getDamageReports = async (req, res) => {
  const reports = await DamageReport.find().populate("rental_id");
  res.json(reports);
};

exports.resolveDamageReport = async (req, res) => {
  const { deduction_amount } = req.body;
  const report = await DamageReport.findById(req.params.id);
  report.status = "deducted";
  report.deduction_amount = deduction_amount;
  await report.save();
  res.json({ message: "Damage report resolved", report });
};


exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.removeFakeListing = async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Listing removed" });
};

exports.manageDispute = async (req, res) => {
  const { resolution } = req.body;
  const dispute = await Dispute.findById(req.params.id);
  dispute.status = "resolved";
  dispute.resolution = resolution;
  await dispute.save();
  res.json({ message: "Dispute resolved", dispute });
};

exports.moderateReview = async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: "Review removed" });
};
