const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

exports.register = async (req, res) => {
  try {
    const { role, firstName, lastName, uin, email, password } = req.body;

    if (!role || !firstName || !lastName || !uin || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!/^\d{12}$/.test(uin)) {
      return res.status(400).json({ message: 'Invalid UIN format' });
    }

    const existingUser = await User.findOne({ uin });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      role,
      firstName,
      lastName,
      uin,
      email,
      password: hashedPassword,
      doctorApproved: role === "doctor" ? false : true,  // If doctor, set approval to false
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, SECRET_KEY, { expiresIn: "1h" });

    const { password: _, ...userData } = newUser._doc;

    res.status(201).json({ user: userData, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  console.log("LOGIN ATTEMPT:", req.body);
  const { uin, password } = req.body;

  try {
    const user = await User.findOne({ uin });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: pw, ...userData } = user._doc;

    res.json({ user: userData, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkAuth = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    try {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ user });
    } catch (error) {
      console.error("Check-auth error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};
