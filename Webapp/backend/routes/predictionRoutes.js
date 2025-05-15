const express = require("express");
const router = express.Router();
const Prediction = require("../models/Prediction");
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");
const OpenAI = require("openai");
const axios = require("axios");
const qs = require("querystring");

router.use(authMiddleware);

const apiKey = process.env.API_KEY || "b57bd78af5379de05d7b1e6c801bd495";

const openai = new OpenAI({
  apiKey: apiKey,
});

const altApiBaseUrl = "http://195.179.229.119/gpt/api.php";

async function generateOpenAICompletion(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI error:", err.message);
    throw err;
  }
}

async function generateAltAPICompletion(prompt) {
  try {
    const url = `${altApiBaseUrl}?${qs.stringify({
      prompt: prompt,
      api_key: apiKey,
      model: "gpt-3.5-turbo",
    })}`;

    const response = await axios.get(url);
    if (response.data) {
      return typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    } else {
      throw new Error("No response data from alternative API");
    }
  } catch (err) {
    console.error("Alternative GPT API error:", err.message);
    throw err;
  }
}

async function generateGPTFeedback(prompt) {
  try {
    return await generateOpenAICompletion(prompt);
  } catch {
    return await generateAltAPICompletion(prompt);
  }
}

router.post("/save", async (req, res) => {
  try {
    const { uin, prediction, medicalInputs } = req.body;

    if (!uin || typeof uin !== "string" || uin.trim() === "") {
      return res.status(400).json({ error: "Valid UIN is required" });
    }
    if (prediction === undefined || prediction === null) {
      return res.status(400).json({ error: "Prediction value is required" });
    }

    const numericPrediction = parseFloat(prediction);
    if (isNaN(numericPrediction)) {
      return res.status(400).json({ error: "Prediction must be a valid number." });
    }

    const prompt = `A patient has a cardiovascular risk prediction score of ${numericPrediction}. 
Their medical inputs are:
- Systolic BP: ${medicalInputs.systolicBP}
- Diastolic BP: ${medicalInputs.diastolicBP}
- Cholesterol: ${medicalInputs.cholesterol}
- Glucose: ${medicalInputs.glucose}
- Smoking: ${medicalInputs.smoking ? "Yes" : "No"}
- Alcohol intake: ${medicalInputs.alcoholIntake ? "Yes" : "No"}
- Physical activity: ${medicalInputs.physicalActivity ? "Yes" : "No"}

Please write a short, professional health feedback summary with recommendations for the patient.`;

    const rawFeedback = await generateGPTFeedback(prompt);

    // Extract only the content if response is an object
    const gptFeedback =
      typeof rawFeedback === "string"
        ? rawFeedback
        : rawFeedback.content || JSON.stringify(rawFeedback);

    const newPredictionDoc = new Prediction({
      uin,
      prediction: numericPrediction,
      medicalInputs,
      feedback: gptFeedback,
      timestamp: new Date(),
    });

    await newPredictionDoc.save();

    res.status(201).json({
      message: "Prediction and feedback saved successfully",
      data: newPredictionDoc,
    });
  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).json({
      error: "Failed to save prediction",
      details: error.message,
    });
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
