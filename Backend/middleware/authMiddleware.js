import jwt from 'jsonwebtoken';

/**
 * Middleware to protect routes based on user roles.
 * @param {string|null} requiredRole - 'doctor', 'patient', or null for any authenticated user.
 */
const authMiddleware = (requiredRole = null) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // Check if Authorization header exists and is properly formatted
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing or malformed' });
      }

      // Extract token and verify
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user data to the request object
      req.user = {
        _id: decoded.id,
        role: decoded.role,
        email: decoded.email,
      };

      // Role-based access control (if role is specified)
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }

      next(); // Proceed to next middleware or route handler
    } catch (error) {
      console.error('Auth Error:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

export default authMiddleware;

