const User = require("../models/User");
const Prediction = require("../models/Prediction");
const ConnectionRequest = require("../models/ConnectionRequest");
const { sendNotification } = require("../controllers/authController"); // Make sure sendNotification is async exported
exports.respondToIncomingRequest = async (req, res) => {
  const doctorId = req.user.userId;
  const { requestId } = req.params;
  const { action } = req.body;

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: "Invalid action." });
  }

  try {
    const request = await ConnectionRequest.findById(requestId);
    if (!request || request.doctorId.toString() !== doctorId || request.status !== 'pending_doctor_approval') {
      return res.status(403).json({ message: "Not authorized or invalid request." });
    }

    request.status = action === 'accept' ? 'doctor_accepted' : 'doctor_rejected';
    request.responseTimestamp = new Date();
    await request.save();

    if (action === 'accept') {
      await User.findByIdAndUpdate(request.clientId, { assignedDoctorId: doctorId });
    }

    res.json({ message: `Request ${action}ed successfully.` });
  } catch (err) {
    console.error("Respond error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getPendingRequestsForClient = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'patient') {
      return res.status(403).json({ message: "Forbidden: User is not a patient." });
    }
    const clientId = req.user.userId;
    const pendingRequests = await ConnectionRequest.find({
      clientId,
      status: 'pending_client_approval'
    }).populate('doctorId', 'firstName lastName email uin');

    res.json(pendingRequests || []);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Server error." });
  }
};



exports.respondToConnectionRequest = async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body;
  const patientId = req.user.userId;

  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({ message: "Invalid action." });
  }

  try {
    const connectionRequest = await ConnectionRequest.findById(requestId);
    if (!connectionRequest) return res.status(404).json({ message: "Request not found." });

    if (connectionRequest.clientId.toString() !== patientId) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    if (connectionRequest.status !== "pending_client_approval") {
      return res.status(400).json({ message: "Request already handled." });
    }

    if (action === "accept") {
      connectionRequest.status = "client_accepted";
      await User.findByIdAndUpdate(patientId, { assignedDoctorId: connectionRequest.doctorId });
    } else {
      connectionRequest.status = "client_rejected";
    }

    await connectionRequest.save();
    res.json({ message: `Request ${action}ed successfully.` });
  } catch (error) {
    console.error("Respond error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.disconnectRequest = async (req, res) => {
  const { requestId } = req.params;
  const patientId = req.user.userId;

  try {
    const connectionRequest = await ConnectionRequest.findById(requestId);
    if (!connectionRequest) return res.status(404).json({ message: "Request not found." });

    if (connectionRequest.clientId.toString() !== patientId) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    await User.findByIdAndUpdate(patientId, { $unset: { assignedDoctorId: "" } });
    connectionRequest.status = "disconnected";
    await connectionRequest.save();

    res.json({ message: "Disconnected successfully." });
  } catch (error) {
    console.error("Disconnect error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const patients = await User.find({ role: "patient", assignedDoctorId: doctorId })
      .select("firstName lastName email uin");
    res.json(patients);
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getPatientPredictions = async (req, res) => {
  const { uin } = req.params;
  try {
    const patient = await User.findOne({ uin, role: "patient" });
    if (!patient) return res.status(404).json({ message: "Patient not found." });

    const predictions = await Prediction.find({ uin });
    res.json(predictions);
  } catch (error) {
    console.error("Prediction fetch error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.approvePrediction = async (req, res) => {
  const { predictionId } = req.params;
  try {
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) return res.status(404).json({ message: "Prediction not found." });

    prediction.status = "approved";
    await prediction.save();

    // Notify patient
    const patient = await User.findOne({ uin: prediction.uin });
    if (patient && patient.email) {
      const mailSubject = "Your Cardiovascular Prediction was Approved";
      const mailMessage = `
        Dear ${patient.firstName},

        Your cardiovascular risk prediction submitted on ${prediction.timestamp.toDateString()} was approved by your doctor.

        Please check your dashboard for detailed feedback.

        Regards,
        CardioCare System
      `;
      sendNotification(patient.email, mailSubject, mailMessage);
    }

    res.json({ message: "Prediction approved.", prediction });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.cancelPrediction = async (req, res) => {
  const { predictionId } = req.params;
  try {
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) return res.status(404).json({ message: "Prediction not found." });

    prediction.status = "canceled";
    await prediction.save();

    // Notify patient
    const patient = await User.findOne({ uin: prediction.uin });
    if (patient && patient.email) {
      const mailSubject = "Your Cardiovascular Prediction was Rejected";
      const mailMessage = `
        Dear ${patient.firstName},

        Your cardiovascular risk prediction submitted on ${prediction.timestamp.toDateString()} was rejected by your doctor.

        Please contact your doctor or check your dashboard for more details.

        Regards,
        CardioCare System
      `;
      sendNotification(patient.email, mailSubject, mailMessage);
    }

    res.json({ message: "Prediction canceled.", prediction });
  } catch (error) {
    console.error("Cancel error:", error);
    res.status(500).json({ message: "Server error." });
  }
};


exports.addPredictionFeedback = async (req, res) => {
  const { predictionId } = req.params;
  const { feedback } = req.body;
  try {
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) return res.status(404).json({ message: "Prediction not found." });

    prediction.feedback = feedback;
    await prediction.save();
    res.json({ message: "Feedback saved.", prediction });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.browseAllClients = async (req, res) => {
  try {
    const unassigned = await User.find({
      role: "patient",
      assignedDoctorId: { $exists: false },
    }).select("firstName lastName email uin");
    res.json(unassigned);
  } catch (error) {
    console.error("Browse clients error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getSentConnectionRequests = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const sent = await ConnectionRequest.find({
      doctorId,
      status: "pending_client_approval",
    }).select("clientId");
    res.json(sent);
  } catch (error) {
    console.error("Sent requests error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.requestConnection = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const clientId = req.params.clientId;

    const existing = await ConnectionRequest.findOne({
      doctorId,
      clientId,
      status: "pending_client_approval",
    });

    if (existing) return res.status(400).json({ message: "Request already sent." });

const request = new ConnectionRequest({
  doctorId,
  clientId,
  initiatedBy: "doctor", 
  status: "pending_client_approval" 
});
    await request.save();

    res.json({ message: "Request sent." });
  } catch (error) {
    console.error("Request connection error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
exports.getPredictionSummary = async (req, res) => {
  const { uin } = req.params;

  try {
    const summary = await Prediction.aggregate([
      { $match: { uin } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the result into { pending: X, approved: Y, canceled: Z }
    const counts = { pending: 0, approved: 0, canceled: 0 };
    summary.forEach(item => {
      counts[item._id] = item.count;
    });

    res.json(counts);
  } catch (error) {
    console.error("Prediction summary error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getClientInitiatedRequests = async (req, res) => {
  const doctorId = req.user.userId;
  try {
    const requests = await ConnectionRequest.find({
      doctorId,
      status: 'pending_doctor_approval',
      initiatedBy: 'client'
    }).populate('clientId', 'firstName lastName email uin');
    res.json(requests);
  } catch (error) {
    console.error("Error fetching client requests:", error);
    res.status(500).json({ message: "Server error." });
  }
};
