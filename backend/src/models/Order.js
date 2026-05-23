const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    variation: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      price: Number,
      discounted: Number
    },
    addons: [{
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      description: String,
      quantity_minimum: Number,
      quantity_maximum: Number,
      options: [{
        _id: mongoose.Schema.Types.ObjectId,
        title: String,
        price: Number
      }]
    }],
    quantity: Number
  }],
  delivery_address: {
    latitude: Number,
    longitude: Number,
    delivery_address: String,
    details: String,
    label: String
  },
  delivery_charges: { type: Number, default: 0 },
  order_amount: Number,
  paid_amount: Number,
  payment_method: String,
  order_status: { type: String, default: 'PENDING' },
  payment_status: { type: String, default: 'PENDING' },
  status: { type: Boolean, default: true },
  reason: String,
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  review: {
    rating: Number,
    description: String,
    is_active: { type: Boolean, default: true }
  },
  coupon: {
    code: String,
    discount: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
