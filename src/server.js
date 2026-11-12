'use strict';

const app = require('./app');
const env = require('./config/env');
const pool = require('./database/pool');

const server = app.listen(env.PORT, () => {
  console.log(
    `[news-api] rodando em http://localhost:${env.PORT} (${env.NODE_ENV})`,
  );
  console.log(`[news-api] documentacao Swagger: http://localhost:${env.PORT}/docs`);
});

async function shutdown(signal) {
  console.log(`\n[news-api] recebido ${signal}. Encerrando...`);

  server.close(async () => {
    try {
      await pool.end();
      console.log('[news-api] conexoes encerradas.');
      process.exit(0);
    } catch (error) {
      console.error('[news-api] erro ao encerrar pool MySQL:', error.message);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('[news-api] encerramento forcado apos timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
