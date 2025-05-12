const express = require("express");
const router = express.Router();
const Prediction = require("../models/Prediction");
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");
router.use(authMiddleware);

router.get("/pending-requests", doctorController.getPendingRequestsForClient);
router.post("/respond-request/:requestId", doctorController.respondToConnectionRequest);
// Backend Router (Express.js)
router.post("/save", async (req, res) => {
  try {
    let { uin, prediction } = req.body;
    console.log("Received for /save:", { uin, prediction, predictionType: typeof prediction }); // Log what's received

    if (!uin || typeof uin !== 'string' || uin.trim() === "") {
      console.error("Invalid or missing UIN");
      return res.status(400).json({ error: "Valid UIN is required" });
    }

    if (prediction === undefined || prediction === null) {
      console.error("Missing prediction value (undefined or null)");
      return res.status(400).json({ error: "Prediction value is required" });
    }

    const numericPrediction = parseFloat(prediction); // Attempt to parse

    if (isNaN(numericPrediction)) {
      console.error("Prediction is not a valid number:", prediction);
      return res.status(400).json({ error: "Prediction must be a valid number." });
    }

    const newPredictionDoc = new Prediction({
      uin,
      prediction: numericPrediction, // Use the parsed and validated number
      timestamp: new Date(),
    });

    await newPredictionDoc.save();
    console.log("Prediction saved:", newPredictionDoc);
    res.status(201).json({ message: "Prediction saved successfully", data: newPredictionDoc }); // Send 201 for successful creation
  } catch (error) {
    console.error("Error saving prediction:", error); // THIS IS THE KEY LOG
    if (error.name === 'ValidationError') {
      // Send back specific validation errors
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    // For other errors, send a generic 500
    res.status(500).json({ error: "Failed to save prediction", details: error.message });
  }
});

router.get("/history", async (req, res) => {
  try {
    const { uin } = req.query;
    if (!uin) return res.status(400).json({ error: "UIN is required" });

    const history = await Prediction.find({ uin }).sort({ timestamp: -1 });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = router;