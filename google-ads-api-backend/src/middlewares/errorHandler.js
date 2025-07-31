const logger = require('../infrastructure/logger');

const errorHandler = (error, req, res, next) => {
  logger.error('Erro não tratado:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados de entrada inválidos',
      code: 'VALIDATION_ERROR',
      details: error.details || error.message
    });
  }

  if (error.message && error.message.includes('GoogleAdsError')) {
    return res.status(400).json({
      error: 'Erro na API do Google Ads',
      code: 'GOOGLE_ADS_ERROR',
      details: error.message
    });
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.statusCode || 500).json({
    error: isDevelopment ? error.message : 'Erro interno do servidor',
    code: 'INTERNAL_SERVER_ERROR',
    ...(isDevelopment && { stack: error.stack })
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  asyncHandler
};
