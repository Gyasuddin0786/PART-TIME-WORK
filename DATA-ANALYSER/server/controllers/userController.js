const User = require("../models/User");
const jwt = require("jsonwebtoken");

const signToken = (user) =>
  jwt.sign({ id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET || "secret_key", { expiresIn: "7d" });

// 👉 Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user._id);

    if (name && name !== user.name) {
      user.name = name;
    }

    // ✅ Image upload
    if (req.file) {
      user.profile = req.file.path;
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({ error: "Old password incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};