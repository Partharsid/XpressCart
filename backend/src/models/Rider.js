const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const riderSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String,
  phone: String,
  available: { type: Boolean, default: true },
  location: {
    latitude: Number,
    longitude: Number
  },
  push_token: String,
  createdAt: { type: Date, default: Date.now }
});

riderSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Rider', riderSchema);
