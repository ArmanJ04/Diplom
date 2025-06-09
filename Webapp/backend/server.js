require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration
const corsOptions = {
  origin: "https://cardiohealth-hbwy.onrender.com", // Your frontend URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ Enable preflight requests for all routes

// Middleware
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Base Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api", doctorRoutes); // Optional duplicate?
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
