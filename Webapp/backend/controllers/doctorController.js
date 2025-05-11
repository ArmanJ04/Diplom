const User = require("../models/User");
const Prediction = require("../models/Prediction");
const ConnectionRequest = require("../models/ConnectionRequest");

// Get all patients assigned to the logged-in doctor
exports.getPatients = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const patients = await User.find({
      role: "patient",
      assignedDoctorId: doctorId
    }).select("firstName lastName email uin");

    res.json(patients);
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get prediction history of a specific patient (by UIN)
exports.getPatientPredictions = async (req, res) => {
  const { uin } = req.params;

  try {
    const patient = await User.findOne({ uin });
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    const predictions = await Prediction.find({ patientId: patient._id });
    res.json(predictions);
  } catch (error) {
    console.error("Get predictions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve a specific prediction
exports.approvePrediction = async (req, res) => {
  const { uin, predictionId } = req.params;

  try {
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ message: "Prediction not found" });
    }

    prediction.status = "approved";
    await prediction.save();

    res.json({ message: "Prediction approved", prediction });
  } catch (error) {
    console.error("Approve prediction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel a specific prediction
exports.cancelPrediction = async (req, res) => {
  const { uin, predictionId } = req.params;

  try {
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ message: "Prediction not found" });
    }

    prediction.status = "canceled";
    await prediction.save();

    res.json({ message: "Prediction canceled", prediction });
  } catch (error) {
    console.error("Cancel prediction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Browse all unassigned patients (for doctors)
exports.browseAllClients = async (req, res) => {
  try {
    const unassignedPatients = await User.find({
      role: "patient",
      assignedDoctorId: { $exists: false }
    }).select("firstName lastName email uin");

    res.json(unassignedPatients);
  } catch (error) {
    console.error("Browse clients error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get list of sent connection requests by a doctor
exports.getSentConnectionRequests = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const sent = await ConnectionRequest.find({
      doctorId,
      status: "pending_client_approval"
    }).select("clientId");
    res.json(sent);
  } catch (err) {
    console.error("Get sent requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send a connection request to a patient
exports.requestConnection = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const clientId = req.params.clientId;

    const existing = await ConnectionRequest.findOne({
      doctorId,
      clientId,
      status: "pending_client_approval"
    });

    if (existing) {
      return res.status(400).json({ message: "Request already sent." });
    }

    const request = new ConnectionRequest({ doctorId, clientId });
    await request.save();

    res.json({ message: "Request sent." });
  } catch (err) {
    console.error("Send request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Patients: View all pending connection requests sent to them
exports.getPendingRequestsForClient = async (req, res) => {
  try {
    const clientId = req.user.userId;
    const pendingRequests = await ConnectionRequest.find({
      clientId,
      status: "pending_client_approval"
    }).populate("doctorId", "firstName lastName email");

    res.json(pendingRequests);
  } catch (err) {
    console.error("Error fetching client requests:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Patients: Respond to a connection request (accept/reject)
exports.respondToConnectionRequest = async (req, res) => {
  const clientId = req.user.userId;
  const { requestId } = req.params;
  const { action } = req.body; // 'accept' or 'reject'

  try {
    const request = await ConnectionRequest.findById(requestId);

    if (!request || request.clientId.toString() !== clientId) {
      return res.status(403).json({ message: "Not authorized or request not found" });
    }

    if (action === "accept") {
      request.status = "client_accepted";
      request.responseTimestamp = new Date();
      await request.save();

      await User.findByIdAndUpdate(clientId, { assignedDoctorId: request.doctorId });

      res.json({ message: "Connection accepted", doctorId: request.doctorId });
    } else if (action === "reject") {
      request.status = "client_rejected";
      request.responseTimestamp = new Date();
      await request.save();

      res.json({ message: "Connection rejected" });
    } else {
      res.status(400).json({ message: "Invalid action" });
    }
  } catch (err) {
    console.error("Respond error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
