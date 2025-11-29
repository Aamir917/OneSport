const jwt = require('jsonwebtoken');
require('dotenv').config();
const Admin = require('../models/admin'); // make sure admin model exists

const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Invalid token format' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(403).json({ message: 'Admin not found' });

    req.admin = admin; // attach admin info to request
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: 'Unauthorized' });
  }
};

module.exports = authAdmin;
