const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  discount: Number,
  enabled: { type: Boolean, default: true }
});

module.exports = mongoose.model('Coupon', couponSchema);
