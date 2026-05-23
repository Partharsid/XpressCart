const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'xpresscart_jwt_secret_change_in_production';

const authMiddleware = (context) => {
  const authHeader = context.req?.headers?.authorization;
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { user: decoded };
    } catch (err) {
      return { user: null };
    }
  }
  return { user: null };
};

module.exports = { authMiddleware, JWT_SECRET };
