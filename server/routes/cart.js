// routes/cart.js
const express = require("express");
const router = express.Router();
const auth = require("../utils/auth");
const Cart = require("../models/cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

// =======================
// Add a product to cart
// =======================
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate("items.product");

    res.json({ success: true, cart });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

// =======================
// Remove a product from cart
// =======================
router.post("/remove", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    cart = await Cart.findById(cart._id).populate("items.product");

    res.json({ success: true, cart });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ message: "Failed to remove from cart" });
  }
});

// =======================
// Update product quantity in cart
// =======================
router.post("/update", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (item) item.quantity = Number(quantity);

    await cart.save();
    cart = await Cart.findById(cart._id).populate("items.product");

    res.json({ success: true, cart });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ message: "Failed to update cart" });
  }
});

// =======================
// Fetch user's cart
// =======================
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart) cart = { items: [] };
    res.json({ success: true, cart });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

// =======================
// Checkout: CREATE ORDER + DECREASE STOCK
// =======================
router.post("/checkout", auth, async (req, res) => {
  try {
    const { shippingDetails } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // ✅ 1) Validate stock first
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const qty = Number(item.quantity || 0);
      const stock = Number(product.stock || 0);

      if (qty <= 0) {
        return res.status(400).json({ message: "Invalid cart quantity" });
      }

      if (stock < qty) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${stock}, requested: ${qty}`,
        });
      }
    }

    // ✅ 2) Decrease stock for each product
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -Number(item.quantity) },
      });
    }

    // ✅ 3) Calculate total
    const totalPrice = cart.items.reduce(
      (sum, item) =>
        sum + Number(item.product.price || 0) * Number(item.quantity || 0),
      0
    );

    // ✅ 4) Create order
    const newOrder = await Order.create({
      user: userId,
      items: cart.items.map((ci) => ({
        product: ci.product._id,
        quantity: ci.quantity,
      })),
      shippingDetails: {
        name: shippingDetails?.name || "",
        address: shippingDetails?.address || "",
        phone: shippingDetails?.phone || "",
      },
      totalPrice,
      status: "Pending",
    });

    // ✅ 5) Clear cart
    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
      order: newOrder,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Checkout failed" });
  }
});


module.exports = router;
