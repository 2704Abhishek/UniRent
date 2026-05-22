const Item = require("../models/Item");
const Rental = require("../models/Rental");
const Review = require("../models/Review");

function getUploadedImageUrl(req) {
  if (!req.file) {
    return null;
  }

  return `${req.protocol}://${req.get("host")}/uploads/items/${req.file.filename}`;
}

function buildItemPayload(req) {
  const { body } = req;
  const uploadedImageUrl = getUploadedImageUrl(req);
  const images = uploadedImageUrl
    ? [uploadedImageUrl]
    : Array.isArray(body.images)
      ? body.images.filter(Boolean)
      : [];

  return {
    title: body.title?.trim(),
    description: body.description?.trim() || "",
    category: body.category?.trim() || "",
    condition: body.condition?.trim() || "Good",
    brandModel: body.brandModel?.trim() || "",
    accessories: body.accessories?.trim() || "",
    contactPhone: body.contactPhone?.trim() || "",
    address: body.address?.trim() || "",
    pickupInstructions: body.pickupInstructions?.trim() || "",
    pricePerDay: Number(body.pricePerDay),
    depositAmount: Number(body.depositAmount || 0),
    lateReturnFee: Number(body.lateReturnFee || 0),
    available: body.available ?? true,
    images
  };
}

function calculateSafeRentalScore({ owner, ratingAverage, reviewCount, completedRentals }) {
  let score = 45;

  if (owner?.university_verified) score += 20;
  score += Math.min(Number(owner?.trust_score || 0) / 5, 15);
  score += Math.min(completedRentals * 4, 12);
  score += reviewCount ? Math.min(ratingAverage * 2, 10) : 0;

  return Math.max(0, Math.min(100, Math.round(score)));
}

async function attachTrustSignals(items) {
  const itemList = Array.isArray(items) ? items : [items];
  const ownerIds = [
    ...new Set(
      itemList
        .map((item) => item.owner?._id || item.owner)
        .filter(Boolean)
        .map(String)
    )
  ];

  if (!ownerIds.length) {
    return Array.isArray(items) ? itemList : itemList[0];
  }

  const [reviews, completedRentals] = await Promise.all([
    Review.find({ target_user_id: { $in: ownerIds } }).select("target_user_id rating"),
    Rental.find({
      owner_id: { $in: ownerIds },
      rental_status: { $in: ["returned", "refunded"] }
    }).select("owner_id")
  ]);

  const reviewStats = reviews.reduce((stats, review) => {
    const ownerId = String(review.target_user_id);
    const current = stats[ownerId] || { total: 0, count: 0 };
    current.total += Number(review.rating || 0);
    current.count += 1;
    stats[ownerId] = current;
    return stats;
  }, {});

  const rentalStats = completedRentals.reduce((stats, rental) => {
    const ownerId = String(rental.owner_id);
    stats[ownerId] = (stats[ownerId] || 0) + 1;
    return stats;
  }, {});

  const enrichedItems = itemList.map((item) => {
    const plainItem = item.toObject ? item.toObject() : item;
    const owner = plainItem.owner;
    const ownerId = String(owner?._id || owner || "");
    const ownerReviews = reviewStats[ownerId] || { total: 0, count: 0 };
    const ratingAverage = ownerReviews.count
      ? Number((ownerReviews.total / ownerReviews.count).toFixed(1))
      : 0;
    const completedRentalCount = rentalStats[ownerId] || 0;

    return {
      ...plainItem,
      trustSignals: {
        ratingAverage,
        reviewCount: ownerReviews.count,
        completedRentals: completedRentalCount,
        universityVerified: Boolean(owner?.university_verified),
        trustScore: owner?.trust_score || 0,
        safeRentalScore: calculateSafeRentalScore({
          owner,
          ratingAverage,
          reviewCount: ownerReviews.count,
          completedRentals: completedRentalCount
        })
      }
    };
  });

  return Array.isArray(items) ? enrichedItems : enrichedItems[0];
}

exports.createItem = async (req, res) => {
  try {
    const item = new Item({
      ...buildItemPayload(req),
      owner: req.user.id
    });

    await item.save();
    const populatedItem = await item.populate("owner", "name email university_verified trust_score");
    res.status(201).json(populatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const activeRentals = await Rental.find({
      rental_status: { $in: ["approved", "active"] }
    }).select("item_id");
    const rentedItemIds = new Set(activeRentals.map((rental) => String(rental.item_id)).filter(Boolean));

    const items = await Item.find().populate("owner", "name email university_verified trust_score");
    const itemsWithRentStatus = items.map((item) => ({
      ...item.toObject(),
      isOnRent: rentedItemIds.has(String(item._id))
    }));
    res.json(await attachTrustSignals(itemsWithRentStatus));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user.id }).populate("owner", "name email university_verified trust_score");
    const activeRentals = await Rental.find({
      owner_id: req.user.id,
      rental_status: { $in: ["approved", "active"] }
    }).select("item_id renter_id rental_status");
    const rentedItemIds = new Set(activeRentals.map((rental) => String(rental.item_id)));

    const itemsWithRentStatus = items.map((item) => ({
      ...item.toObject(),
      isOnRent: rentedItemIds.has(String(item._id))
    }));
    res.json(await attachTrustSignals(itemsWithRentStatus));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("owner", "name email university_verified trust_score");

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const activeRental = await Rental.findOne({
      item_id: item._id,
      rental_status: { $in: ["approved", "active"] }
    });

    const itemWithRentStatus = {
      ...item.toObject(),
      isOnRent: Boolean(activeRental)
    };

    res.json(await attachTrustSignals(itemWithRentStatus));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (String(item.owner) !== req.user.id) {
      return res.status(403).json({ error: "You can only update your own items" });
    }

    Object.assign(item, buildItemPayload(req));
    await item.save();

    const populatedItem = await item.populate("owner", "name email university_verified trust_score");
    res.json(populatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (String(item.owner) !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own items" });
    }

    await item.deleteOne();
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
