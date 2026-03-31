const Item = require("../models/Item");

exports.createItem = async (req, res) => {
  try {
    const item = new Item({ ...req.body, owner_id: req.user.id });
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
