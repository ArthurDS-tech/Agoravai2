require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares básicos
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim()) : 
    ['http://localhost:3000', 'http://localhost:3001', 'https://agoravai2-g34t.vercel.app'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Auth routes
app.get('/api/auth/url', async (req, res) => {
  try {
    const { customerId, userId } = req.query;
    
    if (!process.env.GOOGLE_ADS_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        error: 'Configuração do Google Ads não encontrada'
      });
    }

    const state = JSON.stringify({ customerId, userId, timestamp: Date.now() });
    const stateEncoded = Buffer.from(state).toString('base64');
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_ADS_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent('https://agoravai2-c1w0ap2f2-arthurs-projects-9eaa30c1.vercel.app/api/auth/callback')}&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/adwords')}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `state=${stateEncoded}`;

    res.json({
      success: true,
      data: {
        authUrl,
        instructions: 'Acesse a URL para autorizar o acesso ao Google Ads'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar URL de autenticação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Auth callback
app.get('/api/auth/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Autorização negada pelo usuário',
        code: 'AUTHORIZATION_DENIED'
      });
    }

    // Simular processamento do token (implementação completa seria aqui)
    res.json({
      success: true,
      data: {
        message: 'Autenticação realizada com sucesso',
        token: 'demo_jwt_token'
      }
    });
  } catch (error) {
    console.error('Erro no callback OAuth:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Campaigns routes
app.get('/api/campaigns/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Dados de demonstração
    const demoCampaigns = [
      {
        id: '1',
        name: 'Campanha Black Friday 2024',
        status: 'ENABLED',
        budget: 5000,
        impressions: 125000,
        clicks: 6250,
        cost: 3750.50,
        ctr: '5.00'
      },
      {
        id: '2',
        name: 'Produtos Eletrônicos',
        status: 'ENABLED',
        budget: 3000,
        impressions: 89000,
        clicks: 3560,
        cost: 2140.25,
        ctr: '4.00'
      }
    ];

    res.json({
      success: true,
      data: {
        campaigns: demoCampaigns,
        total: demoCampaigns.length,
        customerId,
        filters: {}
      },
      message: `${demoCampaigns.length} campanhas encontradas`
    });
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Metrics routes
app.get('/api/metrics/:customerId/summary', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    res.json({
      success: true,
      data: {
        summary: {
          totalCampaigns: 5,
          activeCampaigns: 3,
          totalImpressions: 349000,
          totalClicks: 13860,
          totalCost: 8322.00,
          averageCtr: '3.97'
        },
        customerId
      },
      message: 'Resumo de métricas obtido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

module.exports = app;