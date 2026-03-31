const express = require("express");
const router = express.Router();
const { getAllUsers, removeFakeListing, manageDispute, moderateReview } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/users", authMiddleware, getAllUsers);
router.delete("/items/:id", authMiddleware, removeFakeListing);
router.post("/disputes/:id", authMiddleware, manageDispute);
router.delete("/reviews/:id", authMiddleware, moderateReview);
router.get("/damage-reports", authMiddleware, getDamageReports);
router.post("/damage-reports/:id", authMiddleware, resolveDamageReport);


module.exports = router;
