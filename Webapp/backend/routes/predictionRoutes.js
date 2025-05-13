const express = require("express");
const router = express.Router();
const Prediction = require("../models/Prediction");
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");
router.use(authMiddleware);

router.get("/pending-requests", doctorController.getPendingRequestsForClient);
router.post("/respond-request/:requestId", doctorController.respondToConnectionRequest);
// Save Prediction Route
router.post("/save", async (req, res) => {
  try {
    let { uin, prediction, medicalInputs } = req.body;

    console.log("Received for /save:", { uin, prediction, medicalInputs }); // Log received data for debugging

    // Validation
    if (!uin || typeof uin !== 'string' || uin.trim() === "") {
      console.error("Invalid or missing UIN");
      return res.status(400).json({ error: "Valid UIN is required" });
    }

    if (prediction === undefined || prediction === null) {
      console.error("Missing prediction value (undefined or null)");
      return res.status(400).json({ error: "Prediction value is required" });
    }

    const numericPrediction = parseFloat(prediction);
    if (isNaN(numericPrediction)) {
      console.error("Prediction is not a valid number:", prediction);
      return res.status(400).json({ error: "Prediction must be a valid number." });
    }

    // Log medicalInputs to check if it's coming properly
    console.log("Medical Inputs:", medicalInputs);  // Log to see if medical inputs are included

    // Create new Prediction document
    const newPredictionDoc = new Prediction({
      uin,
      prediction: numericPrediction,
      medicalInputs: medicalInputs,  // Store medical inputs here
      timestamp: new Date(),
    });

    await newPredictionDoc.save(); // Save to DB
    console.log("Prediction saved:", newPredictionDoc); // Log to confirm
    res.status(201).json({ message: "Prediction saved successfully", data: newPredictionDoc });
  } catch (error) {
    console.error("Error saving prediction:", error);
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