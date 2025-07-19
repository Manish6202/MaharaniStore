const Admin = require("../models/Admin");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login only (no registration needed)
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Admin Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
