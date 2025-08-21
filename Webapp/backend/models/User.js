const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["doctor", "patient"],
    required: true,
  },
  firstName: { type: String },
  lastName: { type: String },
  uin: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  doctorApproved: {
    type: Boolean,
    default: false,
    required: function () {
      return this.role === "doctor";
    },
  },

  birthdate: Date,
  gender: String,
  height: Number,
  weight: Number,
  bloodPressure: String,
  glucose: Number,
  smoking: Boolean,
  alcohol: Boolean,
  physicalActivity: String,

  assignedDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("User", userSchema);
