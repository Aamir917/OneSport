const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config(); // Load JWT_SECRET from .env

// ===========================
// REGISTER
// ===========================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists (case-insensitive)
    const existingUser = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existingUser) return res.status(400).json({ message: 'Email already registered', success: false });

    const user = new User({ name, email, password }); // plain text for now
    await user.save();

    res.status(201).json({
      message: 'User registered successfully!',
      user: { name: user.name, email: user.email },
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', success: false });
  }
});

// ===========================
// LOGIN
// ===========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (!user || password !== user.password) {
      return res.status(400).json({ message: 'Invalid email or password', success: false });
    }

    // Generate JWT using env secret
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful!',
      token,
      user: { name: user.name, email: user.email },
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', success: false });
  }
});

// ===========================
// GET PROFILE
// ===========================
const auth = require('../utils/auth'); // your middleware
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
