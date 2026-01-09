// routes/orders.js
const express = require("express");
const router = express.Router();
const auth = require("../utils/auth");
const Order = require("../models/Order");

// ==============================
// GET /api/orders/my-orders
// ==============================
router.get("/my-orders", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price imageUrl");

    res.json(orders);
  } catch (err) {
    console.error("Error fetching my orders:", err);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
});

// ==============================
// GET /api/orders/:id  (order details)
// ==============================
router.get("/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate("items.product", "name price imageUrl")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Only allow owner (or admin if you have isAdmin in req.user)
    if (order.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this order." });
    }

    res.json(order);
  } catch (err) {
    console.error("Error fetching order details:", err);
    res.status(500).json({ message: "Failed to fetch order details." });
  }
});

module.exports = router;
