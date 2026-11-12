'use strict';

const pool = require('../database/pool');

async function findAll({ limit, offset }) {
  const [rows] = await pool.query(
    `SELECT id, nome, slug, codigo_ibge
       FROM tenants
      WHERE ativo = 1
      ORDER BY nome ASC
      LIMIT ? OFFSET ?`,
    [limit, offset],
  );

  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM tenants WHERE ativo = 1',
  );

  return { rows, total };
}

async function findBySlug(slug) {
  const [rows] = await pool.query(
    `SELECT id, nome, slug, codigo_ibge, ativo, created_at, updated_at
       FROM tenants
      WHERE slug = ? AND ativo = 1
      LIMIT 1`,
    [slug],
  );

  return rows[0] || null;
}

module.exports = { findAll, findBySlug };
