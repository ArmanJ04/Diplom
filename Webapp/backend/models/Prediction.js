const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  uin: { type: String, required: true }, // UIN of the patient
  prediction: { type: Number, required: true }, // Prediction score
  timestamp: { type: Date, default: Date.now }, // When the prediction was created
  feedback: { type: String, default: "" }, // Feedback from the doctor
  status: {
    type: String,
    enum: ["pending", "approved", "canceled"], // Prediction status
    default: "pending", // Default status is 'pending'
  },
  medicalInputs: { // Medical data used for prediction
    systolicBP: { type: String, required: true },
    diastolicBP: { type: String, required: true },
    cholesterol: { type: String, required: true },
    glucose: { type: String, required: true },
    smoking: { type: Boolean, required: true },
    alcoholIntake: { type: Boolean, required: true },
    physicalActivity: { type: Boolean, required: true },
  }
});

module.exports = mongoose.model("Prediction", PredictionSchema);
