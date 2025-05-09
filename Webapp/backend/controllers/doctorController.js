const User = require("../models/User");
const Prediction = require("../models/Prediction");
const mongoose = require('mongoose');

exports.getAssignedPatients = async (req, res) => {
  try {
    const doctorId = req.user.userId;

    if (req.user.role === 'doctor' && !req.user.doctorApproved) {
        return res.status(403).json({ message: "Your doctor account must be approved by an admin to perform this action." });
    }

    const patients = await User.find({
      role: "client",
      assignedDoctorId: doctorId
    }).select("-password -__v");
    res.json(patients);
  } catch (error) {
    console.error("Error fetching assigned patients:", error);
    res.status(500).json({ message: "Server error while fetching patients." });
  }
};

exports.getPatientPredictionsByUin = async (req, res) => {
  const { uin } = req.params;
  const doctorId = req.user.userId;

  try {
    if (req.user.role === 'doctor' && !req.user.doctorApproved) {
        return res.status(403).json({ message: "Your doctor account must be approved to view patient data." });
    }

    const patient = await User.findOne({ uin, role: "client" });
    if (!patient) {
      return res.status(404).json({ message: "Patient with this UIN not found." });
    }

    if (!patient.assignedDoctorId || patient.assignedDoctorId.toString() !== doctorId) {
         return res.status(403).json({ message: "Forbidden: You are not the assigned doctor for this patient." });
    }

    const predictions = await Prediction.find({ patientId: patient._id })
                                        .sort({ createdAt: -1 })
                                        .populate('doctorId', 'firstName lastName')
                                        .select("-__v");
    res.json(predictions);
  } catch (error) {
    console.error("Error fetching patient predictions:", error);
    res.status(500).json({ message: "Server error while fetching predictions." });
  }
};

exports.validatePrediction = async (req, res) => {
  const { predictionId } = req.params;
  const doctorId = req.user.userId;
  const { comment } = req.body;


  if (!mongoose.Types.ObjectId.isValid(predictionId)) {
    return res.status(400).json({ message: "Invalid Prediction ID format." });
  }

  try {
    if (req.user.role === 'doctor' && !req.user.doctorApproved) {
        return res.status(403).json({ message: "Your doctor account must be approved to validate predictions." });
    }

    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ message: "Prediction not found." });
    }

    const patient = await User.findById(prediction.patientId);
    if (!patient || !patient.assignedDoctorId || patient.assignedDoctorId.toString() !== doctorId) {
        return res.status(403).json({ message: "Forbidden: You are not authorized to validate predictions for this patient." });
    }

    prediction.status = "doctor_validated";
    prediction.doctorId = doctorId;
    prediction.doctorActionTimestamp = new Date();
    if (comment) prediction.doctorComment = comment;
    else if (!prediction.doctorComment) prediction.doctorComment = "Validated by doctor.";


    await prediction.save();
    res.json({ message: "Prediction validated successfully.", prediction });
  } catch (error) {
    console.error("Error validating prediction:", error);
    res.status(500).json({ message: "Server error while validating prediction." });
  }
};

exports.rejectPrediction = async (req, res) => {
  const { predictionId } = req.params;
  const doctorId = req.user.userId;
  const { comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(predictionId)) {
    return res.status(400).json({ message: "Invalid Prediction ID format." });
  }
  if (!comment || comment.trim() === "") {
    return res.status(400).json({ message: "A comment is required to mark a prediction for revision." });
  }

  try {
    if (req.user.role === 'doctor' && !req.user.doctorApproved) {
        return res.status(403).json({ message: "Your doctor account must be approved to reject predictions." });
    }

    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ message: "Prediction not found." });
    }

    const patient = await User.findById(prediction.patientId);
     if (!patient || !patient.assignedDoctorId || patient.assignedDoctorId.toString() !== doctorId) {
        return res.status(403).json({ message: "Forbidden: You are not authorized to reject predictions for this patient." });
    }

    prediction.status = "doctor_needs_revision";
    prediction.doctorId = doctorId;
    prediction.doctorActionTimestamp = new Date();
    prediction.doctorComment = comment;

    await prediction.save();
    res.json({ message: "Prediction marked for revision.", prediction });
  } catch (error) {
    console.error("Error rejecting prediction:", error);
    res.status(500).json({ message: "Server error while rejecting prediction." });
  }
};

exports.addPredictionFeedback = async (req, res) => {
  const { predictionId } = req.params;
  const { comment } = req.body;
  const doctorId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(predictionId)) {
    return res.status(400).json({ message: "Invalid Prediction ID format." });
  }
  if (!comment || typeof comment !== 'string' || comment.trim() === "") {
    return res.status(400).json({ message: "Comment is required and cannot be empty." });
  }

  try {
    if (req.user.role === 'doctor' && !req.user.doctorApproved) {
        return res.status(403).json({ message: "Your doctor account must be approved to add feedback." });
    }

    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ message: "Prediction not found." });
    }

    const patient = await User.findById(prediction.patientId);
    if (!patient || !patient.assignedDoctorId || patient.assignedDoctorId.toString() !== doctorId) {
        return res.status(403).json({ message: "Forbidden: You are not authorized to add feedback for this patient's prediction." });
    }

    prediction.doctorComment = comment;
    prediction.doctorId = doctorId;
    prediction.doctorActionTimestamp = new Date();
    
    if (prediction.status === 'pending_review' || prediction.status === 'client_acknowledged' || prediction.status === 'doctor_commented') {
        prediction.status = 'doctor_commented';
    }


    await prediction.save();
    res.json({ message: "Feedback added successfully.", prediction });
  } catch (error) {
    console.error("Error adding prediction feedback:", error);
    res.status(500).json({ message: "Server error while adding feedback." });
  }
};
