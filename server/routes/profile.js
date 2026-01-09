// routes/profile.js
const express = require('express');
const router = express.Router();

const auth = require('../utils/auth');   // same middleware you use in cart routes
const User = require('../models/user');

// ==============================
// GET /api/profile
// ==============================
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;  // from auth middleware
    const user = await User.findById(userId).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// ==============================
// PUT /api/profile  (name, email, phone)
// ==============================
router.put('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name  !== undefined) user.name  = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    const updatedUser = await User.findById(userId).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);

    // handle duplicate email nicely
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// ==============================
// PUT /api/profile/address
// ==============================
router.put('/address', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { street, city, state, pincode } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.address = {
      street:  street  || "",
      city:    city    || "",
      state:   state   || "",
      pincode: pincode || "",
    };

    await user.save();

    res.json({
      message: 'Address updated successfully',
      address: user.address,
    });
  } catch (err) {
    console.error('Error updating address:', err);
    res.status(500).json({ message: 'Failed to update address' });
  }
});

// ==============================
// PUT /api/profile/change-password
// plain text password, with extra validation
// ==============================
router.put('/change-password', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // plain-text comparison (since you’re not hashing)
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: 'New password must be different from the current password.',
      });
    }

    user.password = newPassword; // still plain text in DB
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Failed to update password.' });
  }
});

module.exports = router;
