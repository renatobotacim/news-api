#!/bin/sh
set -e

echo "[entrypoint] aplicando migrations..."
node scripts/migrate.js

echo "[entrypoint] carregando seed (se o banco estiver vazio)..."
node scripts/seed.js

echo "[entrypoint] iniciando API..."
exec node src/server.js
