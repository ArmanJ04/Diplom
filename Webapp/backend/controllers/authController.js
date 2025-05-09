const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // Assuming you still use this for password reset

const SECRET_KEY = process.env.JWT_SECRET || "your_very_secure_secret_key_jwt"; // Fallback for JWT
const RESET_SECRET = process.env.RESET_SECRET || "your_very_secure_secret_key_reset"; // Fallback for Reset

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.register = async (req, res) => {
  try {
    const { role, firstName, lastName, uin, email, password } = req.body;

    if (!role || !firstName || !lastName || !uin || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!/^\d{12}$/.test(uin)) {
      return res.status(400).json({ message: "UIN must be exactly 12 digits" });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
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
      password: hashedPassword,
      // doctorApproved will be set by model default if role is 'doctor'
    };

    const newUser = new User(userData);
    await newUser.save();

    const tokenPayload = {
        userId: newUser._id,
        role: newUser.role,
    };
    if (newUser.role === 'doctor') {
        tokenPayload.doctorApproved = newUser.doctorApproved; // Should be false by default from model
    }

    const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    const { password: _, ...userDataSafe } = newUser._doc;

    res.status(201).json({ user: userDataSafe });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `An account with this ${duplicateField} already exists.` });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  const { uin, password } = req.body;

  if (!uin || !password) {
    return res.status(400).json({ message: "UIN and password are required." });
  }

  try {
    const user = await User.findOne({ uin });
    if (!user) {
      return res.status(400).json({ message: "Invalid UIN or password." });
    }
    
    // This check is important. If a doctor's approval is revoked, they shouldn't be able to log in.
    if (user.role === "doctor" && !user.doctorApproved) {
      return res.status(403).json({ message: "Your doctor account is pending admin approval or has been suspended." });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid UIN or password." });
    }

    const tokenPayload = {
        userId: user._id,
        role: user.role,
    };
    if (user.role === 'doctor') {
        tokenPayload.doctorApproved = user.doctorApproved;
    }
    const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, 
    });

    const { password: _, ...userDataSafe } = user._doc;

    return res.json({ message: "Login successful", user: userDataSafe });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
};

exports.checkAuth = async (req, res) => {
  // The authMiddleware already verifies the token and attaches req.user
  // We just need to fetch the latest user data to ensure it's fresh, especially doctorApproved status
  try {
    const userFromDb = await User.findById(req.user.userId).select("-password");
    if (!userFromDb) {
      // This case means the user ID in a valid token no longer exists in DB
      res.clearCookie("token");
      return res.status(401).json({ message: "User not found, session terminated." });
    }

    // If it's a doctor, ensure their approval status is still valid
    if (userFromDb.role === "doctor" && !userFromDb.doctorApproved) {
        res.clearCookie("token"); // Log them out if their approval was revoked
        return res.status(403).json({ message: "Doctor account not approved. Session terminated." });
    }

    res.json({ user: userFromDb });
  } catch (error) {
    console.error("Check-auth error:", error);
    res.status(500).json({ message: "Server error during auth check." });
  }
};


exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email not found." });
    }

    const resetToken = jwt.sign({ id: user._id }, RESET_SECRET, { expiresIn: "15m" });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 15 minutes.</p><p>If you did not request this, please ignore this email.</p>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent. Please check your inbox." });
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ message: "Server error sending password reset email." });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  try {
    const decoded = jwt.verify(token, RESET_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found or invalid token." });
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Password reset error:", err);
    if (err.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Password reset link has expired." });
    }
    if (err.name === "JsonWebTokenError") {
        return res.status(400).json({ message: "Invalid password reset link." });
    }
    res.status(500).json({ message: "Error resetting password." });
  }
};

exports.logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    expires: new Date(0) // Expire cookie immediately
  });
  res.status(200).json({ message: "Logged out successfully" });
};