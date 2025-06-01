const express = require("express");
const User = require("../models/User"); 
const {
  register,
  requestPasswordReset,
  resetPassword,
  login,        
  checkAuth, 
   logout     
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);
router.post("/login", login);
router.get("/check-auth", authMiddleware, checkAuth);
router.post("/logout", logout);
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ userId not id
    const updatedData = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true }
    );

    if (!updatedUser) {
      console.warn("Could not update user — ID invalid or user not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ user: updatedUser, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;