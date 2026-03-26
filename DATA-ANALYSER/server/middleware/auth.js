const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, "secret_key");

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};