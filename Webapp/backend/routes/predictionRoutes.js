const express = require("express");
const router = express.Router();
const Prediction = require("../models/Prediction");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
// const { callChatGPTAPI } = require('../services/aiFeedbackService'); // Placeholder for your AI service

// Placeholder function - you would replace this with actual API call logic
async function callChatGPTAPI(prompt) {
  // This is a mock. In a real scenario, you'd use the OpenAI SDK or an HTTP client.
  // Ensure you handle API keys securely via environment variables.
  console.log("Mock callChatGPTAPI with prompt:", prompt);
  // Example:
  // const { OpenAI } = require("openai");
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const completion = await openai.chat.completions.create({
  //   model: "gpt-3.5-turbo", // Or your preferred model
  //   messages: [{ role: "user", content: prompt }],
  // });
  // return completion.choices[0].message.content;

  // For now, return a placeholder or a simple rule-based response
  if (prompt.includes("high risk score")) { // Example simplified logic
    return "Given the high risk score, it's crucial to consult a healthcare professional immediately for a thorough evaluation and personalized advice. Lifestyle changes focusing on diet and exercise are also recommended.";
  }
  return "General advice: Maintain a healthy diet, engage in regular physical activity, and monitor your key health indicators. Consult a doctor for personalized advice.";
}


router.post("/save", authMiddleware, async (req, res) => {
  try {
    const {
      uin,
      predictionInputData,
      predictionResultRaw,
      confidenceScore
      // recommendationAI is now generated on the backend
    } = req.body;

    if (!uin || predictionInputData === undefined || predictionResultRaw === undefined) {
      return res.status(400).json({ message: "Missing required fields: uin, predictionInputData, or predictionResultRaw." });
    }

    if (!Array.isArray(predictionInputData) || predictionInputData.length === 0) {
        return res.status(400).json({ message: "predictionInputData must be a non-empty array." });
    }

    const patient = await User.findOne({ uin });
    if (!patient) {
      return res.status(404).json({ message: "Patient with the provided UIN not found." });
    }

    if (req.user.userId !== patient._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You can only save predictions for yourself." });
    }

    let generatedRecommendationAI = "Could not generate AI recommendation at this time."; // Default
    try {
      // Construct a meaningful prompt for the generative AI
      const promptContext = `Patient data features: ${JSON.stringify(predictionInputData)}. Predicted cardiovascular risk score (0-1 scale): ${predictionResultRaw}. Confidence: ${confidenceScore || 'N/A'}.`;
      const prompt = `Based on the following patient context, provide a concise (1-2 sentences) initial health recommendation. ${promptContext}`;
      generatedRecommendationAI = await callChatGPTAPI(prompt);
    } catch (aiError) {
        console.error("Error fetching recommendation from external AI:", aiError);
        // Keep the default recommendation or handle as per your app's logic
    }

    const newPrediction = new Prediction({
      patientId: patient._id,
      uin: patient.uin,
      predictionInputData,
      predictionResultRaw,
      confidenceScore,
      recommendationAI: generatedRecommendationAI,
      status: 'pending_review'
    });

    await newPrediction.save();

    res.status(201).json({ message: "Prediction saved successfully. Initial AI feedback generated.", prediction: newPrediction });

  } catch (error) {
    console.error("Error saving prediction:", error);
    if (error.name === "ValidationError") {
        return res.status(400).json({ message: "Validation Error: " + error.message });
    }
    res.status(500).json({ message: "Server error while saving prediction." });
  }
});

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const patientIdForHistory = req.user.userId;

    const patient = await User.findById(patientIdForHistory);
    if(!patient) {
        return res.status(404).json({ message: "User not found." });
    }
    
    const history = await Prediction.find({ patientId: patient._id })
                                    .sort({ createdAt: -1 })
                                    .populate('doctorId', 'firstName lastName') // Populate doctor info
                                    .select("-__v")
                                    .limit(50);

    res.json({ history });
  } catch (error) {
    console.error("Error fetching prediction history:", error);
    res.status(500).json({ message: "Failed to fetch prediction history." });
  }
});

module.exports = router;
