const xlsx = require("xlsx");
const { detectColumns } = require("../utils/columnDetector");
const { processLeads } = require("../utils/analyzer");
const History = require("../models/History");

exports.analyzeData = async (req, res) => {
  try {
    const file = req.file;
    const manualMap = req.body.manualMap ? JSON.parse(req.body.manualMap) : {};

    const workbook = xlsx.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data.length) return res.status(400).json({ error: "Excel file is empty" });

    const rowKeys = Object.keys(data[0]);
    const { detected, missing } = detectColumns(rowKeys, manualMap);

    if (missing.length) {
      return res.status(400).json({
        error: `Could not detect required column: ${missing.join(", ")}`,
        missing,
        availableColumns: rowKeys,
      });
    }

    const result = processLeads(data, detected);

    await History.create({
      userId: req.user.id,
      fileName: file.originalname,
      result,
      detectedColumns: detected,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { filter } = req.query;
    const now = new Date();
    const from = new Date();
    if (filter === "day") from.setDate(now.getDate() - 1);
    else if (filter === "week") from.setDate(now.getDate() - 7);
    else if (filter === "month") from.setMonth(now.getMonth() - 1);
    else if (filter === "year") from.setFullYear(now.getFullYear() - 1);
    else from.setFullYear(2000);

    const history = await History.find({
      userId: req.user.id,
      createdAt: { $gte: from },
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
