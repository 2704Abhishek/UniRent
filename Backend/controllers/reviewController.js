const Review = require("../models/Review");

exports.getReviews = async (req, res) => {
  const reviews = await Review.find();
  res.json(reviews);
};

exports.addReview = async (req, res) => {
  const { reviewer_id, target_user_id, rating, comment } = req.body;
  const review = new Review({ reviewer_id, target_user_id, rating, comment });
  await review.save();
  res.json(review);
};
