'use strict';

const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  const status = Number.isInteger(error.status) ? error.status : 500;

  if (status >= 500) {
    console.error('[api] erro inesperado:', error);
  }

  const body = {
    error: {
      status,
      message:
        status >= 500 && env.NODE_ENV === 'production'
          ? 'Erro interno do servidor.'
          : error.message,
    },
  };

  if (error.details !== undefined) {
    body.error.details = error.details;
  }

  res.status(status).json(body);
}

module.exports = errorHandler;
