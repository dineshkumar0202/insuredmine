const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  dob: { type: Date },
  address: { type: String },
  phoneNumber: { type: String },
  state: { type: String },
  zipCode: { type: String },
  email: { type: String, unique: true },
  gender: { type: String },
  userType: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
