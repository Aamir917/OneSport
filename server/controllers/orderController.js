const Order = require('../models/Order');

// Get all orders (for admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('products.product');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get total orders report
exports.getOrdersReport = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalSales = await Order.aggregate([
            { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } }
        ]);

        res.status(200).json({
            totalOrders,
            totalSales: totalSales[0].totalAmount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
