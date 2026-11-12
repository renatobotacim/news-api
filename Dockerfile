FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY scripts ./scripts
COPY migrations ./migrations
COPY seed_prefeituras_multitenant.sql ./
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

ENV PORT=3000
EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/v1/health" >/dev/null || exit 1

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
