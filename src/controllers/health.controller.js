'use strict';

const pool = require('../database/pool');
const { asyncHandler } = require('../utils/asyncHandler');

const check = asyncHandler(async (req, res) => {
  const startedAt = process.hrtime.bigint();

  try {
    await pool.query('SELECT 1');
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      database: 'down',
      message: 'Banco de dados indisponivel.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

  res.json({
    status: 'ok',
    database: 'up',
    uptime_seconds: Math.round(process.uptime()),
    response_time_ms: Number(elapsedMs.toFixed(2)),
    timestamp: new Date().toISOString(),
  });
});

module.exports = { check };
