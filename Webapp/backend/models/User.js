const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["doctor", "patient"], required: true },
  firstName: String,
  lastName: String,
  uin: { type: String, required: true, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  doctorApproved: {
    type: Boolean,
    default: undefined, // will be explicitly set
    select: true,
  },
  emailVerified: { type: Boolean, default: false },
  birthdate: Date,
  gender: String,
  height: Number,
  weight: Number,
  bloodPressure: String,
  glucose: Number,
  smoking: Boolean,
  alcohol: Boolean,
  physicalActivity: String,
});

module.exports = mongoose.model("User", userSchema);
