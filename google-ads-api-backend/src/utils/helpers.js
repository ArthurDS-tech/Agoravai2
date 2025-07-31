const crypto = require('crypto');

const microsToDecimal = (micros) => {
  return parseInt(micros || 0) / 1000000;
};

const calculateCTR = (clicks, impressions) => {
  if (!impressions || impressions === 0) return '0.00';
  return ((clicks / impressions) * 100).toFixed(2);
};

const calculateCPC = (cost, clicks) => {
  if (!clicks || clicks === 0) return '0.00';
  return (cost / clicks).toFixed(2);
};

const validateCustomerId = (customerId) => {
  if (!customerId) return false;
  const cleaned = customerId.toString().replace(/[-\s]/g, '');
  return /^\d{10}$/.test(cleaned);
};

const formatCustomerId = (customerId) => {
  return customerId.toString().replace(/[-\s]/g, '');
};

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  microsToDecimal,
  calculateCTR,
  calculateCPC,
  validateCustomerId,
  formatCustomerId,
  delay
};
