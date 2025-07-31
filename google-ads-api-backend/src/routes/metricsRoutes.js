const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middlewares/errorHandler');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateCustomerId, sanitizeInput } = require('../middlewares/validation');

router.get('/:customerId/summary', [
  authMiddleware,
  validateCustomerId,
  sanitizeInput
], asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  
  // Implementação simplificada para o exemplo
  res.json({
    success: true,
    data: {
      summary: {
        totalCampaigns: 5,
        activeCampaigns: 3,
        totalImpressions: 100000,
        totalClicks: 5000,
        totalCost: 2500.00,
        averageCtr: '5.00'
      },
      customerId
    },
    message: 'Resumo de métricas obtido com sucesso'
  });
}));

module.exports = router;
