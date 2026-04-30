const express = require("express");
const router = express.Router();
const { 
  getAllUsers, 
  getDisputes,
  getStats,
  removeFakeListing, 
  manageDispute, 
  moderateReview, 
  getDamageReports, 
  resolveDamageReport 
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.use(authMiddleware, adminMiddleware);

router.get("/users", getAllUsers);
router.get("/disputes", getDisputes);
router.get("/stats", getStats);
router.delete("/items/:id", removeFakeListing);
router.post("/disputes/:id", manageDispute);
router.delete("/reviews/:id", moderateReview);
router.get("/damage-reports", getDamageReports);
router.post("/damage-reports/:id", resolveDamageReport);


module.exports = router;
