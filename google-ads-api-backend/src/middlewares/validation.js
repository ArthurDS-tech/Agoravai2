const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados de entrada inválidos',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

const validateCustomerId = [
  param('customerId')
    .notEmpty()
    .withMessage('Customer ID é obrigatório')
    .isNumeric()
    .withMessage('Customer ID deve ser numérico')
    .isLength({ min: 10, max: 10 })
    .withMessage('Customer ID deve ter 10 dígitos'),
    
  handleValidationErrors
];

const validateCampaignId = [
  param('campaignId')
    .notEmpty()
    .withMessage('Campaign ID é obrigatório')
    .isNumeric()
    .withMessage('Campaign ID deve ser numérico'),
    
  handleValidationErrors
];

const sanitizeInput = (req, res, next) => {
  for (const key in req.query) {
    if (typeof req.query[key] === 'string') {
      req.query[key] = req.query[key].replace(/[<>]/g, '');
    }
  }
  
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/[<>]/g, '');
      }
    }
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  validateCustomerId,
  validateCampaignId,
  sanitizeInput
};
