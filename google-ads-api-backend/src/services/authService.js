const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const logger = require('../infrastructure/logger');

class AuthService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_ADS_CLIENT_ID,
      process.env.GOOGLE_ADS_CLIENT_SECRET,
      process.env.OAUTH2_REDIRECT_URI
    );
  }

  generateAuthUrl(state = null) {
    try {
      const scopes = [
        'https://www.googleapis.com/auth/adwords',
        'https://www.googleapis.com/auth/adwords.readonly'
      ];

      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true,
        state: state || 'default',
        prompt: 'consent'
      });

      logger.info('URL de autenticação gerada');
      return authUrl;
    } catch (error) {
      logger.error('Erro ao gerar URL de autenticação:', error);
      throw new Error('Falha ao gerar URL de autenticação');
    }
  }

  async exchangeCodeForTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.refresh_token) {
        throw new Error('Refresh token não fornecido. Reautenticação necessária.');
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        tokenType: tokens.token_type || 'Bearer'
      };
    } catch (error) {
      throw new Error(`Falha na troca de código por tokens: ${error.message}`);
    }
  }

  generateInternalToken(userData) {
    try {
      const payload = {
        userId: userData.userId || 'anonymous',
        customerId: userData.customerId,
        refreshToken: userData.refreshToken,
        timestamp: Date.now()
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h',
        algorithm: 'HS256'
      });

      return token;
    } catch (error) {
      throw new Error('Falha ao gerar token de sessão');
    }
  }

  verifyInternalToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      }
      
      throw new Error('Falha na verificação do token');
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new Error('Header de autorização não fornecido');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Formato de autorização inválido. Use: Bearer <token>');
    }

    return parts[1];
  }
}

module.exports = new AuthService();
