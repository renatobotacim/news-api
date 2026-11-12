'use strict';

require('dotenv').config();

function toNumber(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: toNumber(process.env.PORT, 3000),
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: toNumber(process.env.DB_PORT, 3306),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'minha_prefeitura',
  DB_POOL_LIMIT: toNumber(process.env.DB_POOL_LIMIT, 10),
  SEED_FILE: process.env.SEED_FILE || '',
};

module.exports = env;
