'use strict';

require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

const ROOT_DIR = path.join(__dirname, '..');
const DEFAULT_SEED_FILES = [
  path.join(ROOT_DIR, 'seed_prefeituras_multitenant.sql'),
  path.join(ROOT_DIR, 'seeds', 'seed.sql'),
];
const RESET = process.argv.includes('--reset');

function resolveSeedFile() {
  if (env.SEED_FILE) {
    const configured = path.resolve(ROOT_DIR, env.SEED_FILE);
    if (fs.existsSync(configured)) return configured;
    throw new Error(`SEED_FILE nao encontrado: ${configured}`);
  }

  for (const candidate of DEFAULT_SEED_FILES) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    'Nenhum arquivo de seed encontrado. Coloque seed_prefeituras_multitenant.sql na raiz ou defina SEED_FILE no .env.',
  );
}

async function run() {
  const seedFile = resolveSeedFile();
  const sql = fs.readFileSync(seedFile, 'utf8');

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true,
  });

  try {
    const [[{ total }]] = await connection.query('SELECT COUNT(*) AS total FROM tenants');

    if (Number(total) > 0 && !RESET) {
      console.log(
        `[seed] banco ja possui ${total} tenant(s). Nada a fazer. Use "npm run seed -- --reset" para limpar e recarregar.`,
      );
      return;
    }

    if (RESET) {
      console.log('[seed] limpando tabelas notificacoes, noticias e tenants...');
      await connection.query(`
        SET FOREIGN_KEY_CHECKS = 0;
        TRUNCATE TABLE notificacoes;
        TRUNCATE TABLE noticias;
        TRUNCATE TABLE tenants;
        SET FOREIGN_KEY_CHECKS = 1;
      `);
    }

    console.log(`[seed] carregando ${path.relative(ROOT_DIR, seedFile)}...`);
    await connection.query(sql);

    const [[counts]] = await connection.query(`
      SELECT
        (SELECT COUNT(*) FROM tenants) AS tenants,
        (SELECT COUNT(*) FROM noticias) AS noticias,
        (SELECT COUNT(*) FROM notificacoes) AS notificacoes
    `);

    console.log(
      `[seed] concluido: ${counts.tenants} tenant(s), ${counts.noticias} noticia(s) e ${counts.notificacoes} notificacao(oes).`,
    );
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('[seed] falhou:', error.message);
  process.exitCode = 1;
});
