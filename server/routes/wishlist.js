const express = require("express");
const router = express.Router();
const auth = require("../utils/auth");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/cart");

// ==============================
// GET /api/wishlist  (Get user wishlist)
// ==============================
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    let wishlist = await Wishlist.findOne({ user: userId })
      .populate("items.product");

    if (!wishlist) wishlist = { items: [] };

    res.json(wishlist);
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ message: "Failed to load wishlist" });
  }
});

// ==============================
// POST /api/wishlist/add
// ==============================
router.post("/add", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    const exists = wishlist.items.find(
      (item) => item.product.toString() === productId
    );

    if (!exists) {
      wishlist.items.push({ product: productId });
    }

    await wishlist.save();
    wishlist = await wishlist.populate("items.product");

    res.json({ success: true, wishlist });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

// ==============================
// POST /api/wishlist/remove
// ==============================
router.post("/remove", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) return res.json({ success: false, message: "Wishlist empty" });

    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );

    await wishlist.save();
    wishlist = await wishlist.populate("items.product");

    res.json({ success: true, wishlist });
  } catch (err) {
    console.error("Error removing wishlist item:", err);
    res.status(500).json({ message: "Failed to remove item" });
  }
});

// ==============================
// POST /api/wishlist/move-to-cart
// ==============================
router.post("/move-to-cart", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Remove from wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      wishlist.items = wishlist.items.filter(
        (item) => item.product.toString() !== productId
      );
      await wishlist.save();
    }

    // Add to cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const existing = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (existing) existing.quantity += 1;
    else cart.items.push({ product: productId, quantity: 1 });

    await cart.save();

    res.json({ success: true, message: "Moved to cart!" });
  } catch (err) {
    console.error("Error moving item to cart:", err);
    res.status(500).json({ message: "Failed to move item" });
  }
});

module.exports = router;
