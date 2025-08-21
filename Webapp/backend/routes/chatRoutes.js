const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Multer storage config to preserve file extensions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

router.use(authMiddleware);

// Get all chat messages between two users
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

// Post new chat message with optional file upload
router.post("/", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  const senderId = req.user.userId;
  const { receiverId, message } = req.body;
  const file = req.file;

  if (!receiverId) {
    return res.status(400).json({ message: "Receiver is required." });
  }

  if (!message && !file) {
    return res.status(400).json({ message: "Message or file is required." });
  }

  try {
    const newMessageData = {
      senderId,
      receiverId,
      message: message || "",
      read: false,
      timestamp: new Date(),
    };

    if (file) {
      newMessageData.file = {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      };
    }

    const newMessage = new ChatMessage(newMessageData);
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving chat message:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
});

// Mark messages from other user as read
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
