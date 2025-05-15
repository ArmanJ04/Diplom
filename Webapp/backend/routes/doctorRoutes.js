const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");

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
router.get("/prediction/accepted-connections", doctorController.getAcceptedConnectionsForClient);
router.post("/prediction/respond-request/:requestId", doctorController.respondToConnectionRequest);
router.post("/prediction/disconnect-request/:requestId", doctorController.disconnectRequest);

module.exports = router;
