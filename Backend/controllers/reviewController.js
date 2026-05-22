const Review = require("../models/Review");
const Rental = require("../models/Rental");

exports.getReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate("reviewer_id", "name email")
    .populate("target_user_id", "name email")
    .populate("item_id", "title")
    .sort({ createdAt: -1 });
  res.json(reviews);
};

exports.addReview = async (req, res) => {
  try {
    const { target_user_id, rental_id, item_id, rating, comment, review_type = "general" } = req.body;
    const numericRating = Number(rating);

    if (!target_user_id) {
      return res.status(400).json({ error: "Target user is required" });
    }

    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (String(target_user_id) === String(req.user.id)) {
      return res.status(400).json({ error: "You cannot review yourself" });
    }

    if (rental_id) {
      const rental = await Rental.findById(rental_id);
      if (!rental) return res.status(404).json({ error: "Rental not found" });

      const isParticipant = [rental.renter_id, rental.owner_id].some(
        (participantId) => String(participantId) === String(req.user.id)
      );

      if (!isParticipant) {
        return res.status(403).json({ error: "You can only review rentals you participated in" });
      }

      if (!["returned", "refunded"].includes(rental.rental_status)) {
        return res.status(400).json({ error: "Review is available after the item is returned" });
      }

      const existingReview = await Review.findOne({
        reviewer_id: req.user.id,
        target_user_id,
        rental_id
      });

      if (existingReview) {
        return res.status(409).json({ error: "You already reviewed this rental" });
      }
    }

    const review = new Review({
      reviewer_id: req.user.id,
      target_user_id,
      rental_id,
      item_id,
      rating: numericRating,
      comment: comment?.trim() || "",
      review_type
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
