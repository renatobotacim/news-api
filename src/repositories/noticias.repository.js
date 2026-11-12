'use strict';

const pool = require('../database/pool');
const { escapeLike } = require('../utils/validation');

function buildPublishedFilters(tenantId, search) {
  const conditions = [
    'tenant_id = ?',
    "status = 'publicado'",
    'deleted_at IS NULL',
    'publicado_em IS NOT NULL',
    'publicado_em <= NOW()',
  ];
  const params = [tenantId];

  if (search) {
    const term = `%${escapeLike(search)}%`;
    conditions.push('(titulo LIKE ? OR resumo LIKE ?)');
    params.push(term, term);
  }

  return { where: conditions.join(' AND '), params };
}

async function findByTenant(tenantId, { limit, offset, search }) {
  const { where, params } = buildPublishedFilters(tenantId, search);

  const [rows] = await pool.query(
    `SELECT id, titulo, slug, resumo, imagem_capa_url, publicado_em
       FROM noticias
      WHERE ${where}
      ORDER BY publicado_em DESC
      LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM noticias WHERE ${where}`,
    params,
  );

  return { rows, total };
}

async function findBySlug(tenantId, slug) {
  const [rows] = await pool.query(
    `SELECT id, tenant_id, titulo, slug, resumo, conteudo, imagem_capa_url,
            status, publicado_em, created_at, updated_at
       FROM noticias
      WHERE tenant_id = ?
        AND slug = ?
        AND status = 'publicado'
        AND deleted_at IS NULL
        AND publicado_em IS NOT NULL
        AND publicado_em <= NOW()
      LIMIT 1`,
    [tenantId, slug],
  );

  return rows[0] || null;
}

module.exports = { findByTenant, findBySlug };
