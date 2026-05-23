const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  title: String,
  description: String,
  img_url: String,
  stock: { type: Number, default: 0 },
  tag: String,
  is_active: { type: Boolean, default: true },
  variations: [{
    title: String,
    price: Number,
    discounted: Number,
    addons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Addon' }]
  }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Food', foodSchema);
