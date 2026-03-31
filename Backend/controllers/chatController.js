const Chat = require("../models/Chat");

exports.getMessages = async (req, res) => {
  const messages = await Chat.find({ rental_id: req.params.id });
  res.json(messages);
};

exports.sendMessage = async (req, res) => {
  const { rental_id, sender_id, receiver_id, message } = req.body;
  const chat = new Chat({ rental_id, sender_id, receiver_id, message });
  await chat.save();
  res.json(chat);
};
