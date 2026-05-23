const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  phone: String,
  password: String,
  push_token: String,
  is_active: { type: Boolean, default: true },
  addresses: [{
    latitude: Number,
    longitude: Number,
    delivery_address: String,
    details: String,
    label: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
