import { verifyPasetoToken } from '../utils/pasetoTokenUtils.js';

const jwtVerifyMiddleware = async (req, res, next) => {
  if (req.path === '/' || req.path === '/health') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
    });
  }

  const token = authHeader.substring(7);

  try {
    const { valid, decoded, error } = await verifyPasetoToken(token);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: error || 'Invalid or expired token',
      });
    }
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.error('PASETO Verification Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

export default jwtVerifyMiddleware;