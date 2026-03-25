const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const { analyzeData, getHistory } = require("../controllers/analyzeController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", auth, upload.single("file"), analyzeData);
router.get("/history", auth, getHistory);

module.exports = router;
