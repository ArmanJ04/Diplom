const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }  // ✅ New field
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
