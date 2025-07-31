const { GoogleAdsApi } = require('google-ads-api');
const logger = require('../infrastructure/logger');
const { microsToDecimal, calculateCTR } = require('../utils/helpers');

class GoogleAdsService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    if (!process.env.GOOGLE_ADS_CLIENT_ID || 
        !process.env.GOOGLE_ADS_CLIENT_SECRET || 
        !process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
      throw new Error('Credenciais do Google Ads não configuradas corretamente');
    }

    this.client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    logger.info('Google Ads API client inicializado');
  }

  async getCustomerClient(customerId, refreshToken) {
    try {
      const customer = this.client.Customer({
        customer_id: customerId,
        refresh_token: refreshToken || process.env.GOOGLE_ADS_REFRESH_TOKEN,
      });

      await customer.query('SELECT customer.id FROM customer LIMIT 1');
      
      return customer;
    } catch (error) {
      logger.error('Erro ao conectar com cliente Google Ads:', error);
      throw new Error(`Falha na autenticação: ${error.message}`);
    }
  }

  async listCampaigns(customerId, refreshToken, options = {}) {
    const startTime = Date.now();
    
    try {
      const customer = await this.getCustomerClient(customerId, refreshToken);
      
      const { limit = 50 } = options;

      const query = `
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          segments.date,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr
        FROM campaign
        WHERE segments.date DURING LAST_30_DAYS
        ORDER BY metrics.impressions DESC 
        LIMIT ${limit}
      `;

      const campaigns = await customer.query(query);
      
      const responseTime = Date.now() - startTime;
      logger.logGoogleAdsApiCall('listCampaigns', customerId, true, responseTime);
      
      return this.formatCampaignsResponse(campaigns);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.logGoogleAdsApiCall('listCampaigns', customerId, false, responseTime, error);
      throw error;
    }
  }

  formatCampaignsResponse(campaigns) {
    const campaignMap = new Map();

    campaigns.forEach(row => {
      const campaignId = row.campaign.id;
      
      if (!campaignMap.has(campaignId)) {
        campaignMap.set(campaignId, {
          id: campaignId,
          name: row.campaign.name,
          status: row.campaign.status,
          type: row.campaign.advertising_channel_type,
          metrics: {
            impressions: 0,
            clicks: 0,
            cost: 0,
            conversions: 0,
            ctr: 0
          }
        });
      }

      const campaign = campaignMap.get(campaignId);
      campaign.metrics.impressions += parseInt(row.metrics.impressions || 0);
      campaign.metrics.clicks += parseInt(row.metrics.clicks || 0);
      campaign.metrics.cost += microsToDecimal(row.metrics.cost_micros || 0);
      campaign.metrics.conversions += parseFloat(row.metrics.conversions || 0);
    });

    return Array.from(campaignMap.values()).map(campaign => {
      if (campaign.metrics.impressions > 0) {
        campaign.metrics.ctr = calculateCTR(campaign.metrics.clicks, campaign.metrics.impressions);
      }
      return campaign;
    });
  }
}

module.exports = new GoogleAdsService();
