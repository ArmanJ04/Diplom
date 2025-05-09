const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Получить всех докторов, которые не подтверждены
router.get("/pending-doctors", async (req, res) => {
  try {
    const pendingDoctors = await User.find({ role: "doctor", doctorApproved: false });
    res.json(pendingDoctors);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// In `adminRoutes.js`
router.post("/approve-doctor/:id", async (req, res) => {
  try {
    const updatedDoctor = await User.findByIdAndUpdate(
      req.params.id, 
      { doctorApproved: true }, 
      { new: true }
    );

    res.status(200).json({ message: "Doctor approved successfully", updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
