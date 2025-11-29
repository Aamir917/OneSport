const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    imageUrl: { type: String },
    featured: { type: Boolean, default: false } // <-- Add this line
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
