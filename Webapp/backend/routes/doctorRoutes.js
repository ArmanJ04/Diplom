const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(checkRole(['doctor'])); // All routes here are for doctors

// --- Existing Routes for Assigned Patients ---
router.get("/patients", doctorController.getAssignedPatients); // Gets currently assigned patients
router.get("/patients/:uin/predictions", doctorController.getPatientPredictionsByUin);
router.put("/patients/:uin/predictions/:predictionId/validate", doctorController.validatePrediction);
router.put("/patients/:uin/predictions/:predictionId/reject", doctorController.rejectPrediction);
router.post("/patients/:uin/predictions/:predictionId/feedback", doctorController.addPredictionFeedback);

// --- New Routes for Discovering Clients and Connection Requests by Doctor ---
router.get("/browse-clients", doctorController.browseAllClients); // New: Doctor browses all clients
router.post("/request-connection/:clientId", doctorController.requestConnectionToClient); // New: Doctor requests connection
router.get("/connection-requests/sent", doctorController.getSentConnectionRequests); // New: Doctor views their sent requests

module.exports = router;
