'use strict';

require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const RETRIES = 15;
const RETRY_DELAY_MS = 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assertDatabaseName(name) {
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error(
      'DB_NAME invalido. Use apenas letras, numeros e underscore (sem hifens).',
    );
  }
}

async function connectWithRetry() {
  let lastError;

  assertDatabaseName(env.DB_NAME);

  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    let connection;

    try {
      connection = await mysql.createConnection({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        multipleStatements: true,
      });

      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      await connection.changeUser({ database: env.DB_NAME });

      return connection;
    } catch (error) {
      lastError = error;
      if (connection) await connection.end().catch(() => {});

      console.warn(
        `[migrate] MySQL indisponivel (tentativa ${attempt}/${RETRIES}): ${error.code || error.message}`,
      );
      if (attempt < RETRIES) await sleep(RETRY_DELAY_MS);
    }
  }

  throw lastError;
}

async function ensureMigrationsTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_schema_migrations_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function run() {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('[migrate] Nenhuma migration encontrada.');
    return;
  }

  const connection = await connectWithRetry();

  try {
    await ensureMigrationsTable(connection);

    const [executedRows] = await connection.query('SELECT name FROM schema_migrations');
    const executed = new Set(executedRows.map((row) => row.name));

    let applied = 0;

    for (const file of files) {
      if (executed.has(file)) {
        console.log(`[migrate] ignorada (ja aplicada): ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      console.log(`[migrate] aplicando: ${file}`);
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      applied += 1;
    }

    console.log(
      applied > 0
        ? `[migrate] concluido: ${applied} migration(s) aplicada(s).`
        : '[migrate] banco ja esta atualizado.',
    );
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('[migrate] falhou:', error.message);
  process.exitCode = 1;
});
