const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

exports.register = async (req, res) => {
  const { email, password, name, birthdate, gender, height, weight, smoking, alcohol, physicalActivity } = req.body;

  console.log("Request Body:", req.body); // Add this line to log the request body

  // Check for missing required fields
  if (!email || !password || !name || !birthdate || !gender || !height || !weight || physicalActivity === undefined) {
    console.log("Missing fields:", { email, password, name, birthdate, gender, height, weight, physicalActivity }); // Add this line to log missing fields
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Convert birthdate from dd-MMM-yyyy to Date object
    const [day, month, year] = birthdate.split('-');
    const monthIndex = new Date(`${month} 1, 2000`).getMonth(); // Get month index from month name
    const formattedBirthdate = new Date(year, monthIndex, day);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      birthdate: formattedBirthdate, // Ensure birthdate is stored as a Date object
      gender,
      height,
      weight,
      smoking,
      alcohol,
      physicalActivity,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "your_secret_key", { expiresIn: "7d" });

    // Store token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return the FULL user data (excluding password)
    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        createdAt: user.createdAt
      },
      token
    });
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
      // Fetch full user details from the database
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ user });
    } catch (error) {
      console.error("Check-auth error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
};