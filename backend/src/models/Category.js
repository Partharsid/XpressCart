const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title: String,
  description: String,
  img_menu: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', categorySchema);
