// doctorRoutes.js
const express = require("express");
const router = express.Router();
const { getPatients, getPatientPredictions, approvePrediction, cancelPrediction } = require("../controllers/doctorController");

// Get all patients for the doctor
router.get("/patients", getPatients);

// Get predictions for a specific patient
router.get("/patients/:uin/predictions", getPatientPredictions);

// Approve a specific prediction
router.put("/patients/:uin/predictions/:predictionId/approve", approvePrediction);

// Cancel a specific prediction
router.put("/patients/:uin/predictions/:predictionId/cancel", cancelPrediction);

module.exports = router;
