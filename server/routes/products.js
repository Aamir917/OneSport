const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Order = require("../models/Order");
const auth = require("../utils/auth");

/* =====================================================
   ✅ GET all products
   GET /api/products
===================================================== */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/* =====================================================
   ✅ GET single product
   GET /api/products/:id
===================================================== */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

/* =====================================================
   ✅ GET reviews (read-only)
   GET /api/products/:id/reviews
===================================================== */
router.get("/:id/reviews", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("reviews");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product.reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

/* =====================================================
   ✅ CHECK if user can review product
   GET /api/products/:id/reviews/can-review
===================================================== */
router.get("/:id/reviews/can-review", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ canReview: false });
    }

    // ✅ Must have delivered order
    const deliveredOrder = await Order.findOne({
      user: userId,
      status: "Delivered",
      "items.product": productId,
    });

    if (!deliveredOrder) {
      return res.json({ canReview: false });
    }

    // ✅ Must not have reviewed already
    const alreadyReviewed = product.reviews.some(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.json({ canReview: false });
    }

    res.json({ canReview: true });
  } catch (err) {
    console.error("Can-review error:", err);
    res.status(500).json({ canReview: false });
  }
});

/* =====================================================
   ✅ ADD review
   POST /api/products/:id/reviews
===================================================== */
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Delivered order check
    const deliveredOrder = await Order.findOne({
      user: userId,
      status: "Delivered",
      "items.product": productId,
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        message: "You can review only after delivery",
      });
    }

    // ✅ Duplicate review prevention
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    // ✅ Add review
    product.reviews.push({
      user: userId,
      name: req.user.name,
      rating: Number(rating),
      comment: comment || "",
    });

    // ✅ Update ratings
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.numReviews;

    await product.save();

    res.json({
      success: true,
      message: "Review submitted successfully",
    });
  } catch (err) {
    console.error("Review submit error:", err);
    res.status(500).json({
      message: "Failed to submit review",
    });
  }
});

module.exports = router;
