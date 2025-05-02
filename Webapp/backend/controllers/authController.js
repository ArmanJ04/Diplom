const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// === REGISTER ===
exports.register = async (req, res) => {
  try {
    const { role, firstName, lastName, uin, email, password } = req.body;

    if (!role || !firstName || !lastName || !uin || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!/^\d{12}$/.test(uin)) {
      return res.status(400).json({ message: "UIN must be exactly 12 digits" });
    }

    const existingUser = await User.findOne({ $or: [{ uin }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this UIN or Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = {
      role,
      firstName,
      lastName,
      uin,
      email,
      password: hashedPassword
    };

    if (role === "doctor") {
      userData.doctorApproved = false;
    }

    const newUser = new User(userData);
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, SECRET_KEY, { expiresIn: "1h" });

    const { password: _, ...userDataSafe } = newUser._doc;

    res.status(201).json({ user: userDataSafe, token });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `${duplicateField} already in use.` });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// === LOGIN ===
exports.login = async (req, res) => {
  const { uin, password } = req.body;

  try {
    const user = await User.findOne({ uin });
    if (!user) return res.status(400).json({ message: "User not found" });
    
    if (user.role === "doctor" && !user.doctorApproved) {
      return res.status(403).json({ message: "Your doctor account is not approved yet." });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ message: "Login successful", user });
    const { password: pw, ...userData } = user._doc;
    res.json({ user: userData, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// === CHECK AUTH ===
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

// === LOGOUT ===
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};
