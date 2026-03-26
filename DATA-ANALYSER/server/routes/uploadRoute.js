const express = require("express");
const multer = require("multer");

const { protect } = require("../middleware/auth"); // ✅ FIX

const { analyzeData, getHistory } = require("../controllers/analyzeController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", protect, upload.single("file"), analyzeData);
router.get("/history", protect, getHistory);

module.exports = router;