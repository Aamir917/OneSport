// routes/adminOrders.js
const express = require("express");
const router = express.Router();

const authAdmin = require("../utils/adminAuth"); // same as in routes/admin.js
const Order = require("../models/Order");

// ==============================
// GET /api/admin/orders
// Get all orders for admin (with user + product populated)
// ==============================
router.get("/", authAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name imageUrl price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ==============================
// PUT /api/admin/orders/:id/status
// Update status: Pending / Shipped / Delivered
// ==============================
router.put("/:id/status", authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Shipped", "Delivered"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        allowedStatuses,
      });
    }

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("items.product", "name imageUrl price");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
});

module.exports = router;
