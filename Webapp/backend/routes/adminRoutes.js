// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Prediction = require("../models/Prediction");

// GET: All doctors who are not approved
router.get("/pending-doctors", async (req, res) => {
  try {
    const pendingDoctors = await User.find({ role: "doctor", doctorApproved: false });
    res.json(pendingDoctors);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST: Approve doctor by ID
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

// DELETE: Reject and remove doctor
router.delete("/reject-doctor/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Doctor rejected and removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET: All users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Approved doctors
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor", doctorApproved: true });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/predictions", async (req, res) => {
  try {
    const predictions = await Prediction.find();
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE: User by ID
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Admin dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const doctors = await User.countDocuments({ role: "doctor" });
    const patients = await User.countDocuments({ role: "patient" });
    const pending = await User.countDocuments({ role: "doctor", doctorApproved: false });

    const predictionsApproved = await Prediction.countDocuments({ status: "approved" });
    const predictionsRejected = await Prediction.countDocuments({ status: "rejected" });

    res.json({
      users,
      doctors,
      patients,
      pending,
      approved: predictionsApproved,
      rejected: predictionsRejected,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
