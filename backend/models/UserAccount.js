const mongoose = require('mongoose');

const userAccountSchema = new mongoose.Schema({
  accountName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('UserAccount', userAccountSchema);
