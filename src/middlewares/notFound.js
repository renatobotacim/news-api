'use strict';

const { createHttpError } = require('../utils/httpError');

function notFound(req, res, next) {
  next(
    createHttpError(
      404,
      `Recurso nao encontrado: ${req.method} ${req.originalUrl}. Esta API aceita apenas requisicoes GET.`,
    ),
  );
}

module.exports = notFound;
