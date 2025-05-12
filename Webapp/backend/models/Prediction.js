const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  uin: { type: String, required: true }, // Changed from 'email' to 'uin'
  prediction: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  feedback: {type: String, default: ""},
    status: { // Status of the prediction
    type: String,
    enum: ["pending", "approved", "canceled"], // Allow 'pending', 'approved', or 'canceled' status
    default: "pending", // Default is 'pending'
  },
});

module.exports = mongoose.model("Prediction", PredictionSchema);