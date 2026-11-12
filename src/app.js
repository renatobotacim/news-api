'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const openapi = require('./config/openapi');
const apiRoutes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');

// CSP desabilitado apenas para permitir o carregamento da interface do Swagger UI.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.json({
    name: 'News API - Minha Prefeitura',
    version: '1.0.0',
    authentication: 'none',
    docs: '/docs',
    openapi: '/docs.json',
    endpoints: [
      'GET /api/v1/health',
      'GET /api/v1/tenants',
      'GET /api/v1/tenants/:tenantSlug',
      'GET /api/v1/tenants/:tenantSlug/noticias',
      'GET /api/v1/tenants/:tenantSlug/noticias/:noticiaSlug',
      'GET /api/v1/tenants/:tenantSlug/notificacoes',
      'GET /api/v1/tenants/:tenantSlug/notificacoes/:notificacaoId',
    ],
  });
});

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    customSiteTitle: 'News API - Minha Prefeitura',
    swaggerOptions: {
      docExpansion: 'list',
      defaultModelsExpandDepth: 0,
      displayRequestDuration: true,
      tryItOutEnabled: true,
    },
  }),
);

app.get('/docs.json', (req, res) => {
  res.json(openapi);
});

app.use('/api/v1', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
