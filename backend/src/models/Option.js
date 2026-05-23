const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Option', optionSchema);
