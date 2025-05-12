const User = require("../models/User");
const Prediction = require("../models/Prediction");
const ConnectionRequest = require("../models/ConnectionRequest");
exports.getPendingRequestsForClient = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'patient') {
      return res.status(403).json({ message: "Forbidden: User is not a patient." });
    }
    const clientId = req.user.userId;
    const pendingRequests = await ConnectionRequest.find({
      clientId: clientId,
      status: 'pending_client_approval'
    }).populate('doctorId', 'firstName lastName email uin');

    res.json(pendingRequests || []);
  } catch (error) {
    console.error("Error in getPendingRequestsForClient:", error);
    res.status(500).json({ message: "Server error fetching pending requests for client." });
  }
};
exports.respondToConnectionRequest = async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; // 'accept' or 'reject'
  const patientId = req.user.userId; // Logged-in user is the patient

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: "Invalid action. Must be 'accept' or 'reject'." });
  }

  try {
    // Fetch the connection request
    const connectionRequest = await ConnectionRequest.findById(requestId);

    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    // Ensure the request belongs to the logged-in patient
    if (connectionRequest.clientId.toString() !== patientId) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to respond to this request." });
    }

    if (connectionRequest.status !== 'pending_client_approval') {
      return res.status(400).json({ message: "This request is no longer pending a response or has already been actioned." });
    }

    if (action === 'accept') {
      // Update connection status
      connectionRequest.status = 'approved_by_client';
      await User.findByIdAndUpdate(patientId, { assignedDoctorId: connectionRequest.doctorId });
      await connectionRequest.save();
      res.json({ message: "Connection request accepted successfully." });
    } else if (action === 'reject') {
      connectionRequest.status = 'rejected_by_client';
      await connectionRequest.save();
      res.json({ message: "Connection request rejected." });
    }
  } catch (error) {
    console.error(`Error in respondToConnectionRequest for ID ${requestId}:`, error);
    res.status(500).json({ message: "Server error while responding to connection request." });
  }
};


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

exports.getPatientPredictions = async (req, res) => {
  const { uin } = req.params;

  try {
    const patient = await User.findOne({ uin: uin, role: "patient" });
    if (!patient) {
      return res.status(404).json({ message: "Patient with this UIN not found or user is not a patient." });
    }

    const predictions = await Prediction.find({ uin: uin });
    res.json(predictions);
  } catch (error) {
    console.error(`Error fetching predictions for UIN ${uin}:`, error);
    res.status(500).json({ message: "Server error while fetching patient predictions." });
  }
};

exports.approvePrediction = async (req, res) => {
  const { predictionId } = req.params;
  try {
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) return res.status(404).json({ message: "Prediction not found" });
    prediction.status = "approved";
    await prediction.save();
    res.json({ message: "Prediction approved", prediction });
  } catch (error) {
    console.error("Approve prediction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelPrediction = async (req, res) => {
  const { predictionId } = req.params;
  try {
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) return res.status(404).json({ message: "Prediction not found" });
    prediction.status = "canceled";
    await prediction.save();
    res.json({ message: "Prediction canceled", prediction });
  } catch (error) {
    console.error("Cancel prediction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addPredictionFeedback = async (req, res) => {
  const { predictionId } = req.params;
  const { feedback } = req.body;
  try {
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) return res.status(404).json({ message: "Prediction not found" });
    prediction.feedback = feedback;
    await prediction.save();
    res.json({ message: "Feedback saved", prediction });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.browseAllClients = async (req, res) => {
  try {
    const unassigned = await User.find({
      role: "patient",
      assignedDoctorId: { $exists: false }
    }).select("firstName lastName email uin");
    res.json(unassigned);
  } catch (error) {
    console.error("Browse clients error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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

exports.requestConnection = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const clientId = req.params.clientId;
    const existing = await ConnectionRequest.findOne({
      doctorId,
      clientId,
      status: "pending_client_approval"
    });
    if (existing) return res.status(400).json({ message: "Request already sent." });
    const request = new ConnectionRequest({ doctorId, clientId });
    await request.save();
    res.json({ message: "Request sent." });
  } catch (err) {
    console.error("Send request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
