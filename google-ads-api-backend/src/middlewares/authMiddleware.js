const authService = require('../services/authService');
const logger = require('../infrastructure/logger');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de autorização requerido',
        code: 'MISSING_AUTH_TOKEN'
      });
    }

    const token = authService.extractTokenFromHeader(authHeader);
    const decoded = authService.verifyInternalToken(token);

    req.user = {
      userId: decoded.userId,
      customerId: decoded.customerId,
      refreshToken: decoded.refreshToken
    };

    next();
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    
    return res.status(401).json({
      error: error.message,
      code: 'INVALID_TOKEN'
    });
  }
};

module.exports = {
  authMiddleware
};
