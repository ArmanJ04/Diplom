const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/chat";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/:otherUserId", async (req, res) => {
  const userId = req.user.userId;
  const { otherUserId } = req.params;

  try {
    const messages = await ChatMessage.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  const senderId = req.user.userId;
  const { receiverId, message } = req.body;

  if (!receiverId && !message && !req.file) {
    return res.status(400).json({ message: "receiverId or message or file is required" });
  }

  try {
    const newMessage = new ChatMessage({
      senderId,
      receiverId,
      message,
      read: false,
      timestamp: new Date(),
      fileUrl: req.file ? `/uploads/chat/${req.file.filename}` : null,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving chat message:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
});

router.put("/:otherUserId/read", async (req, res) => {
  const userId = req.user.userId;
  const { otherUserId } = req.params;

  try {
    await ChatMessage.updateMany(
      { senderId: otherUserId, receiverId: userId, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Server error updating read status" });
  }
});

module.exports = router;
