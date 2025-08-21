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
medicalInputs: {
  type: mongoose.Schema.Types.Mixed,
  required: true,
}
});

module.exports = mongoose.model("Prediction", PredictionSchema);
