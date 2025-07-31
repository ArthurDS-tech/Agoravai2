const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true
    })
  ]
});

logger.logApiRequest = (req, statusCode, responseTime) => {
  logger.info('API Request', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
};

logger.logGoogleAdsApiCall = (endpoint, customerId, success, responseTime, error = null) => {
  const logData = {
    type: 'GoogleAdsAPI',
    endpoint,
    customerId,
    success,
    responseTime: `${responseTime}ms`
  };
  
  if (error) {
    logData.error = error.message;
    logger.error('Google Ads API Error', logData);
  } else {
    logger.info('Google Ads API Call', logData);
  }
};

logger.logAuthAction = (action, userId, success, details = {}) => {
  logger.info('Auth Action', {
    action,
    userId,
    success,
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = logger;
