const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema({
  title: String,
  description: String,
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Option' }],
  quantity_minimum: { type: Number, default: 0 },
  quantity_maximum: { type: Number, default: 5 },
  is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Addon', addonSchema);
