require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users'); 
const adminRoutes = require('./routes/admin'); 
const productsRouter = require('./routes/products'); // <-- New products route
const cartRouter = require('./routes/cart');

const app = express();

// =======================
// CORS configuration
// =======================
app.use(cors({
  origin: 'http://localhost:3000', // React frontend
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

// =======================
// Middleware
// =======================
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// Routes
// =======================
app.use('/', indexRouter);             // Optional homepage route
app.use('/api/users', usersRouter);    // User auth routes
app.use('/api/admin', adminRoutes);    // Admin routes
app.use('/api/products', productsRouter); // <-- Products API
app.use('/api/cart', cartRouter);

// =======================
// MongoDB connection
// =======================
const uri = 'mongodb+srv://aaamirkhan917:Mohd%40aamir12@onesport.njlv6n1.mongodb.net/yourdbname?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// =======================
// Catch 404
// =======================
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// =======================
// Error handler
// =======================
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {},
  });
});

// =======================
// Start server
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
