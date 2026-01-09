// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:{ type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:       [orderItemSchema],
  shippingDetails: {
    name:    { type: String, default: "" },
    address: { type: String, default: "" },
    phone:   { type: String, default: "" },
    // add more fields if you use them
  },
  totalPrice:  { type: Number, required: true },
  status:      { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
