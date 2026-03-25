const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  result: { type: Object, required: true },
  detectedColumns: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model("History", historySchema);
