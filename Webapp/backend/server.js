require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const doctorRoutes = require("./routes/doctorRoutes");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:",err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
