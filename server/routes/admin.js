const express = require('express');
const { addProduct, updateProduct, deleteProduct, getAllProducts } = require('../controllers/productController');
const { getAllOrders, getOrdersReport } = require('../controllers/orderController');

const router = express.Router();

// Product routes
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products', getAllProducts);

// Order routes
router.get('/orders', getAllOrders);
router.get('/orders/report', getOrdersReport);

module.exports = router;
