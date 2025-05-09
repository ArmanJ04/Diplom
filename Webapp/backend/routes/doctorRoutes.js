const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(checkRole(['doctor']));

router.get("/patients", doctorController.getAssignedPatients);
router.get("/patients/:uin/predictions", doctorController.getPatientPredictionsByUin);
router.put("/patients/:uin/predictions/:predictionId/validate", doctorController.validatePrediction);
router.put("/patients/:uin/predictions/:predictionId/reject", doctorController.rejectPrediction);
router.post("/patients/:uin/predictions/:predictionId/feedback", doctorController.addPredictionFeedback);

module.exports = router;
