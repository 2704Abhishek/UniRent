const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem
} = require("../controllers/itemController");
const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "items");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }
});

router.post("/", authMiddleware, upload.single("image"), createItem);
router.get("/mine", authMiddleware, getMyItems);
router.get("/", getItems);
router.put("/:id", authMiddleware, upload.single("image"), updateItem);
router.delete("/:id", authMiddleware, deleteItem);
router.get("/:id", getItemById);

module.exports = router;
