const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors'); // Import CORS
const mongoose = require('mongoose');

// Import routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user'); // Ensure correct path
const adminRouter = require('./routes/admin'); // Ensure correct path

const app = express();

// CORS configuration (Development mode - allow any origin)
app.use(cors({
  origin: '*', // Replace '*' with your frontend URL in production, e.g., 'http://localhost:3000'
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

// View engine setup (optional if you're not rendering views)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); // Change to your preferred templating engine if needed

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use routes
app.use('/', indexRouter);
app.use('/api/users', usersRouter); // Prefix for user routes
app.use('/api/admin', adminRouter); // Prefix for admin routes

// MongoDB connection
const uri = 'mongodb+srv://aaamirkhan917:Mohd%40aamir12@cluster0.ss51q.mongodb.net/<YourDatabaseName>'; // Add your database name

async function connectDB() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectDB();

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// API-friendly error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}, // Send full error stack in development
  });
});

// Start the server
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
