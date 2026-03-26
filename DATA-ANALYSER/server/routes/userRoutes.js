const express = require("express");
const multer = require("multer");

const { protect } = require("../middleware/auth");

const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userController");

const router = express.Router();

// ✅ Multer config
const upload = multer({ dest: "uploads/" });

router.get("/profile", protect, getProfile);

// ✅ IMPORTANT (file upload)
router.put("/profile", protect, upload.single("profile"), updateProfile);

router.put("/change-password", protect, changePassword);

module.exports = router;