const express = require('express');
const router = express.Router();
const googleAds = require('../services/googleAdsService');
const { asyncHandler } = require('../middlewares/errorHandler');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateCustomerId, sanitizeInput } = require('../middlewares/validation');
const logger = require('../infrastructure/logger');

router.get('/:customerId', [
  authMiddleware,
  validateCustomerId,
  sanitizeInput
], asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { refreshToken } = req.user;
  const { limit, status } = req.query;
  
  const options = {
    limit: parseInt(limit) || 50,
    status
  };
  
  logger.info('Listando campanhas', { customerId, options });
  
  const campaigns = await googleAds.listCampaigns(customerId, refreshToken, options);
  
  res.json({
    success: true,
    data: {
      campaigns,
      total: campaigns.length,
      customerId,
      filters: options
    },
    message: `${campaigns.length} campanhas encontradas`
  });
}));

module.exports = router;
