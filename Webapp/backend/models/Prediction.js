const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  uin: {
    type: String,
    required: true,
    index: true
  },
  predictionInputData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  predictionResultRaw: {
    type: Number,
    required: true
  },
  confidenceScore: {
    type: Number
  },
  recommendationAI: {
    type: String
  },
  status: {
    type: String,
    enum: [
      'pending_review',
      'doctor_validated',
      'doctor_needs_revision',
      'doctor_commented',
      'client_acknowledged'
    ],
    default: 'pending_review'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  doctorComment: {
    type: String
  },
  doctorActionTimestamp: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("Prediction", PredictionSchema);
