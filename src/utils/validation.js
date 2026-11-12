'use strict';

const { createHttpError } = require('./httpError');

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NOTIFICACAO_TIPOS = ['alerta', 'campanha', 'utilidade_publica', 'emergencia'];

function assertSlug(value, fieldName = 'slug') {
  if (typeof value !== 'string' || value.length === 0 || value.length > 255) {
    throw createHttpError(400, `Parametro "${fieldName}" invalido.`);
  }

  if (!SLUG_PATTERN.test(value)) {
    throw createHttpError(
      400,
      `Parametro "${fieldName}" invalido. Use apenas letras minusculas, numeros e hifens.`,
    );
  }

  return value;
}

function assertUuid(value, fieldName = 'id') {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw createHttpError(400, `Parametro "${fieldName}" deve ser um UUID valido.`);
  }

  return value;
}

function parsePagination(query = {}) {
  const rawPage = Number.parseInt(query.page, 10);
  const rawPerPage = Number.parseInt(query.per_page, 10);

  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const perPageBase = Number.isNaN(rawPerPage) || rawPerPage < 1 ? 10 : rawPerPage;
  const perPage = Math.min(perPageBase, 100);

  return {
    page,
    perPage,
    limit: perPage,
    offset: (page - 1) * perPage,
  };
}

function buildMeta({ page, perPage, total }) {
  return {
    current_page: page,
    last_page: Math.max(1, Math.ceil(total / perPage)),
    per_page: perPage,
    total,
  };
}

function parseSearch(query = {}) {
  if (typeof query.q !== 'string') return '';

  const term = query.q.trim();
  if (term.length === 0) return '';
  if (term.length > 100) {
    throw createHttpError(400, 'O parametro "q" deve ter no maximo 100 caracteres.');
  }

  return term;
}

function parseNotificacaoTipo(query = {}) {
  if (query.tipo === undefined || query.tipo === '') return '';

  const tipo = String(query.tipo).trim().toLowerCase();

  if (!NOTIFICACAO_TIPOS.includes(tipo)) {
    throw createHttpError(
      400,
      `Parametro "tipo" invalido. Valores aceitos: ${NOTIFICACAO_TIPOS.join(', ')}.`,
    );
  }

  return tipo;
}

function escapeLike(value) {
  return value.replace(/[\\%_]/g, '\\$&');
}

module.exports = {
  NOTIFICACAO_TIPOS,
  assertSlug,
  assertUuid,
  parsePagination,
  buildMeta,
  parseSearch,
  parseNotificacaoTipo,
  escapeLike,
};
