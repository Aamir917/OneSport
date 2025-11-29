const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    customer: { 
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true }
    },
    status: { type: String, default: 'Processing' },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
