const Item = require("../models/Item");
const Rental = require("../models/Rental");

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
    contactPhone: body.contactPhone?.trim() || "",
    address: body.address?.trim() || "",
    pricePerDay: Number(body.pricePerDay),
    depositAmount: Number(body.depositAmount || 0),
    available: body.available ?? true,
    images
  };
}

exports.createItem = async (req, res) => {
  try {
    const item = new Item({
      ...buildItemPayload(req),
      owner: req.user.id
    });

    await item.save();
    const populatedItem = await item.populate("owner", "name email");
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

    const items = await Item.find().populate("owner", "name email");
    res.json(items.map((item) => ({
      ...item.toObject(),
      isOnRent: rentedItemIds.has(String(item._id))
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user.id }).populate("owner", "name email");
    const activeRentals = await Rental.find({
      owner_id: req.user.id,
      rental_status: { $in: ["approved", "active"] }
    }).select("item_id renter_id rental_status");
    const rentedItemIds = new Set(activeRentals.map((rental) => String(rental.item_id)));

    res.json(items.map((item) => ({
      ...item.toObject(),
      isOnRent: rentedItemIds.has(String(item._id))
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("owner", "name email");

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const activeRental = await Rental.findOne({
      item_id: item._id,
      rental_status: { $in: ["approved", "active"] }
    });

    res.json({
      ...item.toObject(),
      isOnRent: Boolean(activeRental)
    });
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

    const populatedItem = await item.populate("owner", "name email");
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
