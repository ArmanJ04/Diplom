const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(checkRole(['doctor'])); // Ensure only doctors can access these routes

router.get("/patients", doctorController.getPatients); 
router.get("/patients/:uin/predictions", doctorController.getPatientPredictions);
router.put("/patients/:uin/predictions/:predictionId/validate", doctorController.approvePrediction);
router.put("/patients/:uin/predictions/:predictionId/reject", doctorController.cancelPrediction);
router.post("/patients/:uin/predictions/:predictionId/feedback", doctorController.addPredictionFeedback);

router.get("/browse-clients", doctorController.browseAllClients);
router.post("/request-connection/:clientId", doctorController.requestConnection);
router.get("/connection-requests/sent", doctorController.getSentConnectionRequests);
router.post("/respond-request/:requestId", doctorController.respondToConnectionRequest);

module.exports = router;
