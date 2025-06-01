const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, default: "" },
  file: {
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String,
  },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
}, { timestamps: true });


module.exports = mongoose.model("ChatMessage", chatMessageSchema);
