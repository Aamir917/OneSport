const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user'); // Ensure you have this model

// Secret key for JWT (store securely in production)
const jwtSecret = 'your_jwt_secret';

// User Register API
router.post('/register', async (req, res) => {
  try {
    const userEmailCheck = await User.findOne({ email: new RegExp(`^${req.body.email}$`, 'i') }).exec();
    
    if (userEmailCheck) {
      return res.status(400).json({ message: 'Email already registered', success: false });
    }

    req.body.password = await bcrypt.hash(req.body.password, 10);
    const user = await new User(req.body).save();
    res.status(201).json({ message: "User registered successfully", data: user, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error', data: err, success: false });
  }
});

// User Login API
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: new RegExp(`^${req.body.email}$`, 'i') }).exec();

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password", success: false });
    }
    
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password", success: false });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ message: 'Login successful!', token, user: { name: user.name, email: user.email }, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error', data: err, success: false });
  }
});

module.exports = router;
