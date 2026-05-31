const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyNumber: { type: String, required: true },
  policyStartDate: { type: Date },
  policyEndDate: { type: Date },
  policyCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'LOB' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);
