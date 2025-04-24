// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.username; // Attach the decoded payload to the request object
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export default protect;
