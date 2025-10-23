// Auth Middleware - Verify JWT Token
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    // Extract token from header: "Authorization: Bearer TOKEN"
    // Try different cases since HTTP headers are case-insensitive
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No token provided. Please login first.'
      });
    }

    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach userId to request (available in controllers)
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({
      error: 'Invalid or expired token. Please login again.'
    });
  }
};

export default authMiddleware;1