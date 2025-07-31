const request = require('supertest');
const { app } = require('../../src/server');

describe('Health Check', () => {
  test('GET /health should return OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });
});
