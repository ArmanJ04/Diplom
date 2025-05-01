// doctorController.js
const User = require("../models/User");
const Prediction = require("../models/Prediction");

exports.getPatients = async (req, res) => {
  try {
    const doctor = req.user; // Assuming the doctor is logged in and available in the request
    if (doctor.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can view patients" });
    }

    const patients = await User.find({ role: "client", doctorId: doctor._id }); // Assuming you store doctorId in patient user data
    res.json(patients);
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPatientPredictions = async (req, res) => {
  const { uin } = req.params;
  
  try {
    const patient = await User.findOne({ uin });
    if (!patient || patient.role !== "client") {
      return res.status(404).json({ message: "Patient not found" });
    }

    const predictions = await Prediction.find({ patientId: patient._id }); // Assuming you have a Prediction model linked to the patient
    res.json(predictions);
  } catch (error) {
    console.error("Get predictions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approvePrediction = async (req, res) => {
  const { uin, predictionId } = req.params;

  try {
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ message: "Prediction not found" });
    }

    prediction.status = "approved"; // Mark the prediction as approved
    await prediction.save();

    res.json({ message: "Prediction approved", prediction });
  } catch (error) {
    console.error("Approve prediction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelPrediction = async (req, res) => {
  const { uin, predictionId } = req.params;

  try {
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ message: "Prediction not found" });
    }

    prediction.status = "canceled"; // Mark the prediction as canceled
    await prediction.save();

    res.json({ message: "Prediction canceled", prediction });
  } catch (error) {
    console.error("Cancel prediction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
