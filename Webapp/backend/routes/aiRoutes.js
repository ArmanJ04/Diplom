const { spawn } = require("child_process");
const express = require("express");
const router = express.Router();

router.post("/predict", (req, res) => {
    const { features } = req.body;

    if (!features || !Array.isArray(features)) {
        return res.status(400).json({ error: "Invalid input format. 'features' must be an array." });
    }

    const pythonProcess = spawn("python", ["cardio.py"]);

    pythonProcess.stdin.write(JSON.stringify({ features }));  
    pythonProcess.stdin.end();

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
        console.error("Error from Python script:", data.toString());
    });

    pythonProcess.on("close", (code) => {
        console.log(`Python process exited with code ${code}`);

        if (errorOutput) {
            return res.status(500).json({ error: "Error from Python script", details: errorOutput });
        }

        try {
            const result = JSON.parse(output);
            res.json(result);
        } catch (error) {
            console.error("Error parsing Python output:", output);
            res.status(500).json({ error: "Error processing prediction.", details: output });
        }
    });
});
// In `aiRoutes.js` or wherever predictions are generated
const generateRecommendation = (predictionResult) => {
    // Example recommendation logic based on prediction result
    if (predictionResult === "high-risk") {
      return "We recommend immediate medical attention and lifestyle changes.";
    } else if (predictionResult === "moderate-risk") {
      return "Regular monitoring and a healthier lifestyle are advised.";
    } else {
      return "You are at low risk. Maintain a healthy lifestyle.";
    }
  };
  
  exports.createPrediction = async (req, res) => {
    const { clientId, predictionResult } = req.body;
    
    const recommendation = generateRecommendation(predictionResult);
  
    try {
      const client = await User.findById(clientId);
      if (!client) return res.status(404).json({ message: "Client not found" });
  
      // Send recommendation to doctor (example)
      sendNotification(client.email, "Prediction and Recommendations", recommendation);
  
      res.status(200).json({ message: "Prediction created and doctor notified" });
    } catch (error) {
      console.error("Error creating prediction:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
module.exports = router;