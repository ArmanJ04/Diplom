const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const RESET_SECRET = process.env.RESET_SECRET || "reset_secret_key";
// Create a transporter for Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services like SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER,  // Your email (e.g. "example@gmail.com")
    pass: process.env.EMAIL_PASS   // Your email password or app-specific password
  }
});
exports.updateUser = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    const updateData = req.body;

    // Fetch current user document
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Merge updateData over existing user data for completeness check
    const mergedData = { ...user.toObject(), ...updateData };

    // Required fields for completeness
    const requiredFields = ["firstName", "lastName", "birthdate", "height", "weight", "gender"];

    const profileComplete = requiredFields.every(field => {
      const val = mergedData[field];
      return val !== undefined && val !== null && val !== "";
    });

    // Add profileCompleted flag to updateData so it's saved
    updateData.profileCompleted = profileComplete;

    // Perform update
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


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
      password: hashedPassword,
      profileCompleted: role === "patient" ? false : true,  // patient profile incomplete on register
    };

    if (role === "doctor") {
      userData.doctorApproved = false;  // doctor needs approval
    }

    const newUser = new User(userData);
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

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

const token = jwt.sign(
  { userId: user._id, role: user.role },  // <-- role included here
  SECRET_KEY,
  { expiresIn: "1d" }
);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const { password: pw, ...userData } = user._doc;

    return res.json({ message: "Login successful", user: userData, token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.checkAuth = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    try {
      const userId = decoded.userId;
      const user = await User.findById(userId).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ user });
    } catch (error) {
      console.error("Check-auth error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ id: user._id }, RESET_SECRET, { expiresIn: '15m' });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send reset email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 15 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Reset request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Password Reset (Handling the Token and Reset)
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, RESET_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

const sendNotification = async (recipientEmail, subject, message) => {
  const mailOptions = { from: process.env.EMAIL_USER, to: recipientEmail, subject, html: `<p>${message}</p>` };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Notification email sent:", info.response);
  } catch (error) {
    console.error("Notification email error:", error);
  }
};

exports.sendNotification = sendNotification;

exports.confirmPrediction = async (req, res) => {
  const { clientId, predictionId } = req.body;

  try {
    const client = await User.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    // Assuming prediction confirmation logic here

    const message = "Your prediction has been confirmed by your doctor.";
    sendNotification(client.email, "Prediction Confirmed", message);

    res.status(200).json({ message: "Prediction confirmed and client notified." });
  } catch (error) {
    console.error("Error confirming prediction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};
