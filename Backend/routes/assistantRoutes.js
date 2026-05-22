const express = require("express");
const router = express.Router();
const { handleAssistantMessage } = require("../controllers/assistantController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/message", authMiddleware, handleAssistantMessage);

module.exports = router;
