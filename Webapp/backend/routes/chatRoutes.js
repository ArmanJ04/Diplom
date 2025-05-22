const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

// ✅ Get all messages between two users
router.get("/:otherUserId", async (req, res) => {
  const userId = req.user.userId;
  const { otherUserId } = req.params;

  try {
    const messages = await ChatMessage.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
});

// ✅ Send a new message
router.post("/", async (req, res) => {
  const senderId = req.user.userId;
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    return res.status(400).json({ message: "receiverId and message are required" });
  }

  try {
    const newMessage = new ChatMessage({
      senderId,
      receiverId,
      message,
      read: false,
      timestamp: new Date()
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving chat message:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
});

// ✅ Mark messages as read
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
