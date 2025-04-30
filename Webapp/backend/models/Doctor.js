const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uin: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'doctor' },
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
