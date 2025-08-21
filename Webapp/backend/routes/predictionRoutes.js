const express = require("express");
const router = express.Router();
const Prediction = require("../models/Prediction");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const OpenAI = require("openai");
const axios = require("axios");
const qs = require("querystring");
const { sendNotification } = require("../controllers/authController"); // Make sure sendNotification is async exported

router.use(authMiddleware);

const apiKey = process.env.API_KEY;

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
const prompt = `
You are a cardiologist assistant helping patients understand their cardiovascular risk scores.

A patient has received a cardiovascular risk prediction score of **${numericPrediction}**.

The patient's medical inputs are:
- Systolic BP: ${medicalInputs.systolicBP}
- Diastolic BP: ${medicalInputs.diastolicBP}
- Cholesterol: ${medicalInputs.cholesterol}
- Glucose: ${medicalInputs.glucose}
- Smoking: ${medicalInputs.smoking ? "Yes" : "No"}
- Alcohol intake: ${medicalInputs.alcoholIntake ? "Yes" : "No"}
- Physical activity: ${medicalInputs.physicalActivity ? "Yes" : "No"}

📋 Please generate a short, clear, professional feedback summary in a **doctor-like tone**:
- Briefly interpret the risk score.
- Suggest possible lifestyle or medical recommendations.
- End with a disclaimer that this is an **AI-generated summary** and that the patient should **await feedback from a certified doctor**.
`;


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

    // Notify assigned doctor about new prediction
    const patientUser = await User.findOne({ uin });
    if (patientUser && patientUser.assignedDoctorId) {
      const doctor = await User.findById(patientUser.assignedDoctorId);
      if (doctor && doctor.email) {
        const mailSubject = "New Cardiovascular Prediction Submitted";
        const mailMessage = `
          Dear Dr. ${doctor.firstName},

          A new cardiovascular risk prediction has been submitted by patient ${patientUser.firstName} ${patientUser.lastName} (UIN: ${patientUser.uin}).

          Please review and approve or reject the prediction in your dashboard.

          Regards,
          CardioCare System
        `;
        await sendNotification(doctor.email, mailSubject, mailMessage);
      }
    }

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
    console.error("Error fetching prediction history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = router;
