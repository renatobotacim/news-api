'use strict';

const pool = require('../database/pool');

function buildActiveFilters(tenantId, tipo) {
  const conditions = [
    'tenant_id = ?',
    'ativo = 1',
    'enviado_em <= NOW()',
    '(expira_em IS NULL OR expira_em > NOW())',
  ];
  const params = [tenantId];

  if (tipo) {
    conditions.push('tipo = ?');
    params.push(tipo);
  }

  return { where: conditions.join(' AND '), params };
}

async function findByTenant(tenantId, { limit, offset, tipo }) {
  const { where, params } = buildActiveFilters(tenantId, tipo);

  const [rows] = await pool.query(
    `SELECT id, titulo, mensagem, tipo, link_acao, enviado_em, expira_em
       FROM notificacoes
      WHERE ${where}
      ORDER BY enviado_em DESC
      LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM notificacoes WHERE ${where}`,
    params,
  );

  return { rows, total };
}

async function findById(tenantId, id) {
  const [rows] = await pool.query(
    `SELECT id, tenant_id, titulo, mensagem, tipo, link_acao,
            enviado_em, expira_em, ativo, created_at, updated_at
       FROM notificacoes
      WHERE tenant_id = ?
        AND id = ?
        AND ativo = 1
        AND enviado_em <= NOW()
        AND (expira_em IS NULL OR expira_em > NOW())
      LIMIT 1`,
    [tenantId, id],
  );

  return rows[0] || null;
}

module.exports = { findByTenant, findById };
