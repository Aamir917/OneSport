const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authAdmin = require('../utils/adminAuth'); // your admin JWT middleware
// Add a new product (POST /api/products)
router.post('/add', async (req, res) => {
  try {
    const { name, price, description, category, stock, imageUrl } = req.body;

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      stock,
      imageUrl,
    });

    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add product' });
  }
});

// GET /api/products/featured - limited products for homepage
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find().limit(4); // only 4 products for homepage
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch featured products' });
  }
});

// GET /api/products - all products for products page
router.get('/', async (req, res) => {
  try {
    const products = await Product.find(); // all products
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});
router.get('/', (req, res) => res.send('Products route works'));


// Update product by ID
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;

    // Update product in DB
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true, runValidators: true } // return updated doc & validate fields
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
module.exports = router;


module.exports = router;
