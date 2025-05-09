const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["doctor", "client"],
    required: true
  },
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  uin: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{12}$/, "UIN must be exactly 12 digits"]
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "Please use a valid email address"]
  },
  password: { type: String, required: true },
  doctorApproved: {
    type: Boolean,
    default: function() {
      return this.role === 'doctor' ? false : undefined;
    }
  },
  emailVerified: { type: Boolean, default: false },
  birthdate: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  height: { type: Number, min: 0 },
  weight: { type: Number, min: 0 },
  systolicBP: {type: Number},
  diastolicBP: {type: Number},
  cholesterol: { type: String },
  glucose: { type: String },
  smoking: { type: Boolean },
  alcohol: { type: Boolean },
  physicalActivity: { type: String },
  assignedDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

userSchema.index({ uin: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1, doctorApproved: 1 });
userSchema.index({ role: 1, assignedDoctorId: 1 });

// To make password not selectable by default:
// userSchema.path('password').select(false);

module.exports = mongoose.model("User", userSchema);