const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  smoking: { type: Boolean, default: false },
  alcohol: { type: Boolean, default: false },
  physicalActivity: { type: Number, required: true },
});

module.exports = mongoose.model("User", UserSchema);
