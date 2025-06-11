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
const clientRoutes = require("./routes/clientRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
origin: "https://cardiohealth-hbwy.onrender.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // ✅ must come before routes or parsing
app.options("*", cors(corsOptions)); // ✅ <-- add this line

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://cardiohealth-hbwy.onrender.com");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

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
app.use("/api", doctorRoutes); // optional
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/client", clientRoutes);


// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
