const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const User = require("../models/User");
const Prediction = require("../models/Prediction");
router.use(authMiddleware);

// Doctor access to clients
router.get("/patients", doctorController.getPatients);
router.get("/patients/:uin/predictions", doctorController.getPatientPredictions);
router.put("/patients/:uin/predictions/:predictionId/validate", doctorController.approvePrediction);
router.put("/patients/:uin/predictions/:predictionId/reject", doctorController.cancelPrediction);
router.post("/patients/:uin/predictions/:predictionId/feedback", doctorController.addPredictionFeedback);

// Doctor search and request
router.get("/browse-clients", doctorController.browseAllClients);
router.post("/request-connection/:clientId", doctorController.requestConnection);
router.get("/connection-requests/sent", doctorController.getSentConnectionRequests);
router.post("/disconnect-request/:id", doctorController.disconnectRequest);


// Client-side connection actions (authenticated patient)
router.get("/prediction/pending-requests", doctorController.getPendingRequestsForClient);
router.post("/prediction/respond-request/:requestId", doctorController.respondToConnectionRequest);
router.post("/prediction/disconnect-request/:requestId", doctorController.disconnectRequest);
router.post("/respond-client-request/:requestId", doctorController.respondToIncomingRequest);
router.get("/client-requests", doctorController.getClientInitiatedRequests);
router.get("/patients/:uin/prediction-summary", doctorController.getPredictionSummary);
router.get("/dashboard-stats", authMiddleware, roleMiddleware("doctor"), async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const doctorId = new mongoose.Types.ObjectId(req.user.userId);

    const patients = await User.find({ assignedDoctorId: doctorId, role: "patient" });
    const patientUINs = patients.map((p) => p.uin);

    const pending = await Prediction.countDocuments({
      uin: { $in: patientUINs },
      status: "pending",
    });

    const approved = await Prediction.countDocuments({
      uin: { $in: patientUINs },
      status: "approved",
    });

    res.json({
      stats: {
        patientCount: patients.length,
        pendingPredictions: pending,
        approvedPredictions: approved,
      },
      patients,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Dashboard server error" });
  }
});



module.exports = router;
