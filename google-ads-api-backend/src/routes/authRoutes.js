const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { asyncHandler } = require('../middlewares/errorHandler');
const { sanitizeInput } = require('../middlewares/validation');
const logger = require('../infrastructure/logger');

router.get('/url', sanitizeInput, asyncHandler(async (req, res) => {
  const { customerId, userId } = req.query;
  
  const state = JSON.stringify({ customerId, userId, timestamp: Date.now() });
  const authUrl = authService.generateAuthUrl(Buffer.from(state).toString('base64'));
  
  logger.info('URL de autenticação solicitada', { customerId, userId });
  
  res.json({
    success: true,
    data: {
      authUrl,
      instructions: 'Acesse a URL para autorizar o acesso ao Google Ads'
    }
  });
}));

router.get('/callback', asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;
  
  if (error) {
    logger.error('Erro no callback OAuth2:', error);
    return res.status(400).json({
      success: false,
      error: 'Autorização negada pelo usuário',
      code: 'AUTHORIZATION_DENIED'
    });
  }
  
  const tokens = await authService.exchangeCodeForTokens(code);
  
  let stateData = { customerId: process.env.GOOGLE_ADS_CUSTOMER_ID };
  if (state && state !== 'default') {
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (error) {
      logger.warn('Erro ao fazer parse do state parameter:', error.message);
    }
  }
  
  const userData = {
    userId: stateData.userId || 'anonymous',
    customerId: stateData.customerId || process.env.GOOGLE_ADS_CUSTOMER_ID,
    refreshToken: tokens.refreshToken
  };
  
  const internalToken = authService.generateInternalToken(userData);
  
  res.json({
    success: true,
    data: {
      accessToken: internalToken,
      refreshToken: tokens.refreshToken,
      expiresIn: '24h',
      customerId: userData.customerId,
      tokenType: 'Bearer'
    },
    message: 'Autenticação realizada com sucesso'
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { refreshToken, customerId, userId } = req.body;
  
  if (!refreshToken || !customerId) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token e Customer ID são obrigatórios',
      code: 'MISSING_REQUIRED_FIELDS'
    });
  }
  
  const userData = {
    userId: userId || 'anonymous',
    customerId,
    refreshToken
  };
  
  const internalToken = authService.generateInternalToken(userData);
  
  res.json({
    success: true,
    data: {
      accessToken: internalToken,
      customerId,
      expiresIn: '24h',
      tokenType: 'Bearer'
    },
    message: 'Login realizado com sucesso'
  });
}));

module.exports = router;
