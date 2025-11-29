const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const Cart = require('../models/cart');
const Product = require('../models/Product');

// =======================
// Add a product to cart
// =======================
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    res.json({ success: true, cart });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// =======================
// Remove a product from cart
// =======================
router.post('/remove', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    cart = await Cart.findById(cart._id).populate('items.product');
    res.json({ success: true, cart });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
});

// =======================
// Update product quantity in cart
// =======================
router.post('/update', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (item) item.quantity = quantity;

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    res.json({ success: true, cart });
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

// =======================
// Fetch user's cart
// =======================
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) cart = { items: [] };
    res.json({ success: true, cart });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// =======================
// Checkout: process order and clear cart
// =======================
router.post('/checkout', auth, async (req, res) => {
  try {
    const { shippingDetails } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: 'Cart is empty' });

    const order = {
      user: userId,
      items: cart.items,
      shippingDetails,
      totalPrice: cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
      createdAt: new Date(),
    };

    // Clear cart after checkout
    cart.items = [];
    await cart.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Checkout failed' });
  }
});

// =======================
// Clear user's cart
// =======================
router.post('/clear', auth, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] },
      { new: true }
    );
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

module.exports = router;
