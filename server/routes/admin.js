const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const User = require('../models/user'); // <-- IMPORT USER MODEL
const authAdmin = require('../utils/adminAuth'); // admin JWT middleware
require('dotenv').config();

// =======================
// Admin Login
// =======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || password !== admin.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ success: true, token, admin: { name: admin.name, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// Fetch all users (admin protected)
// =======================
router.get('/users', authAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// =======================
// Delete a user (admin protected)
// =======================
router.delete('/users/:id', authAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



module.exports = router;
