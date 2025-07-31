require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleAdsApi, enums } = require('google-ads-api');

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

// Inicializar Google Ads API
let googleAdsClient = null;
if (process.env.GOOGLE_ADS_CLIENT_ID && process.env.GOOGLE_ADS_CLIENT_SECRET && process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
  googleAdsClient = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    googleAdsConfigured: !!googleAdsClient
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

    if (!googleAdsClient) {
      return res.status(500).json({
        success: false,
        error: 'Google Ads API não configurada'
      });
    }

    // Trocar código por tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://agoravai2-c1w0ap2f2-arthurs-projects-9eaa30c1.vercel.app/api/auth/callback'
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error('Falha ao obter tokens de acesso');
    }

    // Aqui você salvaria os tokens em um banco de dados
    // Por enquanto, vamos retornar um JWT simples
    const jwt = Buffer.from(JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000)
    })).toString('base64');

    res.json({
      success: true,
      data: {
        message: 'Autenticação realizada com sucesso',
        token: jwt,
        expires_in: tokens.expires_in
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
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorização necessário'
      });
    }

    // Se for token demo, retornar dados fictícios
    const token = authHeader.split(' ')[1];
    if (token === 'demo_token') {
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
        },
        {
          id: '3',
          name: 'Campanha Natal',
          status: 'PAUSED',
          budget: 2000,
          impressions: 45000,
          clicks: 1350,
          cost: 810.75,
          ctr: '3.00'
        }
      ];

      return res.json({
        success: true,
        data: {
          campaigns: demoCampaigns,
          total: demoCampaigns.length,
          customerId,
          filters: {}
        },
        message: `${demoCampaigns.length} campanhas encontradas`
      });
    }

    // Para tokens reais, usar Google Ads API
    if (!googleAdsClient) {
      return res.status(500).json({
        success: false,
        error: 'Google Ads API não configurada'
      });
    }

    try {
      // Decodificar token JWT
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Configurar cliente com token
      const customer = googleAdsClient.Customer({
        customer_id: customerId,
        refresh_token: tokenData.refresh_token,
      });

      // Buscar campanhas reais
      const campaigns = await customer.query(`
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.campaign_budget,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr
        FROM campaign 
        WHERE segments.date DURING LAST_30_DAYS
      `);

      const formattedCampaigns = campaigns.map(row => ({
        id: row.campaign.id.toString(),
        name: row.campaign.name,
        status: row.campaign.status,
        budget: row.campaign.campaign_budget || 0,
        impressions: parseInt(row.metrics.impressions) || 0,
        clicks: parseInt(row.metrics.clicks) || 0,
        cost: (parseInt(row.metrics.cost_micros) || 0) / 1000000,
        ctr: parseFloat(row.metrics.ctr || 0).toFixed(2)
      }));

      res.json({
        success: true,
        data: {
          campaigns: formattedCampaigns,
          total: formattedCampaigns.length,
          customerId,
          filters: {}
        },
        message: `${formattedCampaigns.length} campanhas encontradas`
      });

    } catch (apiError) {
      console.error('Erro na Google Ads API:', apiError);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar campanhas do Google Ads',
        details: apiError.message
      });
    }

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
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorização necessário'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Se for token demo, retornar dados fictícios
    if (token === 'demo_token') {
      return res.json({
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
    }

    // Para tokens reais, usar Google Ads API
    if (!googleAdsClient) {
      return res.status(500).json({
        success: false,
        error: 'Google Ads API não configurada'
      });
    }

    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      
      const customer = googleAdsClient.Customer({
        customer_id: customerId,
        refresh_token: tokenData.refresh_token,
      });

      // Buscar métricas resumidas
      const metrics = await customer.query(`
        SELECT 
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          campaign.status
        FROM campaign 
        WHERE segments.date DURING LAST_30_DAYS
      `);

      let totalImpressions = 0;
      let totalClicks = 0;
      let totalCost = 0;
      let totalCampaigns = 0;
      let activeCampaigns = 0;

      metrics.forEach(row => {
        totalImpressions += parseInt(row.metrics.impressions) || 0;
        totalClicks += parseInt(row.metrics.clicks) || 0;
        totalCost += (parseInt(row.metrics.cost_micros) || 0) / 1000000;
        totalCampaigns++;
        if (row.campaign.status === enums.CampaignStatus.ENABLED) {
          activeCampaigns++;
        }
      });

      const averageCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

      res.json({
        success: true,
        data: {
          summary: {
            totalCampaigns,
            activeCampaigns,
            totalImpressions,
            totalClicks,
            totalCost: Math.round(totalCost * 100) / 100,
            averageCtr
          },
          customerId
        },
        message: 'Resumo de métricas obtido com sucesso'
      });

    } catch (apiError) {
      console.error('Erro na Google Ads API:', apiError);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar métricas do Google Ads',
        details: apiError.message
      });
    }

  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Account info route
app.get('/api/account/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorização necessário'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (token === 'demo_token') {
      return res.json({
        success: true,
        data: {
          account: {
            id: customerId,
            name: 'Conta Demonstração',
            currency: 'BRL',
            timezone: 'America/Sao_Paulo',
            status: 'ENABLED'
          }
        }
      });
    }

    if (!googleAdsClient) {
      return res.status(500).json({
        success: false,
        error: 'Google Ads API não configurada'
      });
    }

    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      
      const customer = googleAdsClient.Customer({
        customer_id: customerId,
        refresh_token: tokenData.refresh_token,
      });

      const account = await customer.query(`
        SELECT 
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone,
          customer.status
        FROM customer
        WHERE customer.id = ${customerId}
      `);

      if (account.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Conta não encontrada'
        });
      }

      const accountData = account[0].customer;

      res.json({
        success: true,
        data: {
          account: {
            id: accountData.id.toString(),
            name: accountData.descriptive_name,
            currency: accountData.currency_code,
            timezone: accountData.time_zone,
            status: accountData.status
          }
        }
      });

    } catch (apiError) {
      console.error('Erro na Google Ads API:', apiError);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar informações da conta',
        details: apiError.message
      });
    }

  } catch (error) {
    console.error('Erro ao buscar conta:', error);
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
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'GET /api/auth/url',
      'GET /api/auth/callback',
      'GET /api/campaigns/:customerId',
      'GET /api/metrics/:customerId/summary',
      'GET /api/account/:customerId'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = app;