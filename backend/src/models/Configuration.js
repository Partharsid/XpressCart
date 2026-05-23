const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  order_id_prefix: { type: String, default: 'XC' },
  email: String,
  password: String,
  enable_email: { type: Boolean, default: false },
  client_id: String,
  client_secret: String,
  sandbox: { type: Boolean, default: true },
  publishable_key: String,
  secret_key: String,
  delivery_charges: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  currency_symbol: { type: String, default: '$' }
});

module.exports = mongoose.model('Configuration', configurationSchema);
