const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: 'Unauthorized: No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token)
      return res.status(401).json({ message: 'Unauthorized: Invalid token format' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ use env secret
    req.user = decoded; // attach user info from token
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Token invalid or expired' });
  }
};

module.exports = auth;
