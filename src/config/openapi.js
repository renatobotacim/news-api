'use strict';

const env = require('./env');

const tenantSlugParam = {
  name: 'tenantSlug',
  in: 'path',
  required: true,
  description: 'Slug URL-friendly da prefeitura (tenant).',
  schema: { type: 'string', example: 'venda-nova-do-imigrante' },
};

const pageParam = {
  name: 'page',
  in: 'query',
  required: false,
  description: 'Numero da pagina (a partir de 1).',
  schema: { type: 'integer', minimum: 1, default: 1 },
};

const perPageParam = {
  name: 'per_page',
  in: 'query',
  required: false,
  description: 'Itens por pagina (1 a 100).',
  schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
};

const errorSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 404 },
        message: { type: 'string', example: 'Recurso nao encontrado.' },
        details: { nullable: true },
      },
    },
  },
};

const metaSchema = {
  type: 'object',
  properties: {
    current_page: { type: 'integer', example: 1 },
    last_page: { type: 'integer', example: 5 },
    per_page: { type: 'integer', example: 10 },
    total: { type: 'integer', example: 48 },
  },
};

const tenantSummarySchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      example: 'd7141e90-efae-465b-b2f9-cfa069dd0088',
    },
    nome: { type: 'string', example: 'Prefeitura de Venda Nova do Imigrante' },
    slug: { type: 'string', example: 'venda-nova-do-imigrante' },
    codigo_ibge: { type: 'string', nullable: true, example: '3205069' },
  },
};

const tenantSchema = {
  type: 'object',
  properties: {
    ...tenantSummarySchema.properties,
    ativo: { type: 'integer', enum: [0, 1], example: 1 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const noticiaSummarySchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789',
    },
    titulo: {
      type: 'string',
      example: 'Prefeitura lanca programa de revitalizacao de pracas',
    },
    slug: {
      type: 'string',
      example: 'prefeitura-lanca-programa-revitalizacao-de-pracas',
    },
    resumo: {
      type: 'string',
      example: 'Iniciativa vai abranger dez bairros nos proximos meses.',
    },
    imagem_capa_url: {
      type: 'string',
      nullable: true,
      example: 'https://cdn.prefeitura.gov.br/imgs/pracas.jpg',
    },
    publicado_em: { type: 'string', format: 'date-time' },
  },
};

const noticiaSchema = {
  type: 'object',
  properties: {
    ...noticiaSummarySchema.properties,
    tenant_id: {
      type: 'string',
      format: 'uuid',
      example: 'd7141e90-efae-465b-b2f9-cfa069dd0088',
    },
    conteudo: {
      type: 'string',
      example: '<p>Conteudo completo da noticia.</p>',
    },
    status: {
      type: 'string',
      enum: ['rascunho', 'publicado', 'arquivado'],
      example: 'publicado',
    },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const notificacaoSummarySchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      example: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    },
    titulo: { type: 'string', example: 'Campanha de Alimentos' },
    mensagem: {
      type: 'string',
      example: 'Doe 1kg de alimento nao perecivel no posto de saude mais proximo.',
    },
    tipo: {
      type: 'string',
      enum: ['alerta', 'campanha', 'utilidade_publica', 'emergencia'],
      example: 'campanha',
    },
    link_acao: {
      type: 'string',
      nullable: true,
      example: 'https://prefeitura.gov.br/campanha-alimentos',
    },
    enviado_em: { type: 'string', format: 'date-time' },
    expira_em: { type: 'string', format: 'date-time', nullable: true },
  },
};

const notificacaoSchema = {
  type: 'object',
  properties: {
    ...notificacaoSummarySchema.properties,
    tenant_id: {
      type: 'string',
      format: 'uuid',
      example: 'd7141e90-efae-465b-b2f9-cfa069dd0088',
    },
    ativo: { type: 'integer', enum: [0, 1], example: 1 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'News API - Minha Prefeitura',
    version: '1.0.0',
    description: [
      'API REST publica (somente GET) para consumo dos aplicativos mobile do projeto Minha Prefeitura.',
      '',
      '**Multi-tenancy:** cada prefeitura e identificada pelo `tenantSlug` presente na URL.',
      '',
      '**Sem autenticacao:** todos os endpoints sao abertos e nao exigem token.',
      '',
      'Somente noticias publicadas (nao deletadas e com data de publicacao atingida) e notificacoes ativas (nao expiradas) sao retornadas.',
    ].join('\n'),
  },
  servers: [
    {
      url: '/',
      description: `Mesma origem da documentacao (porta configurada: ${env.PORT})`,
    },
  ],
  tags: [
    { name: 'Health', description: 'Monitoramento da API e do banco de dados.' },
    { name: 'Tenants', description: 'Prefeituras (municipios) disponiveis.' },
    { name: 'Noticias', description: 'Noticias publicadas por prefeitura.' },
    {
      name: 'Notificacoes',
      description: 'Alertas e campanhas ativos por prefeitura.',
    },
  ],
  paths: {
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'Verifica a saude da API e a conexao com o MySQL',
        operationId: 'getHealth',
        responses: {
          200: {
            description: 'API e banco operacionais.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    database: { type: 'string', example: 'up' },
                    uptime_seconds: { type: 'integer', example: 120 },
                    response_time_ms: { type: 'number', example: 1.42 },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          503: {
            description: 'Banco de dados indisponivel.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'degraded' },
                    database: { type: 'string', example: 'down' },
                    message: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/tenants': {
      get: {
        tags: ['Tenants'],
        summary: 'Lista as prefeituras ativas',
        operationId: 'listTenants',
        parameters: [pageParam, perPageParam],
        responses: {
          200: {
            description: 'Lista paginada de prefeituras.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TenantSummary' },
                    },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/v1/tenants/{tenantSlug}': {
      get: {
        tags: ['Tenants'],
        summary: 'Detalha uma prefeitura pelo slug',
        operationId: 'getTenantBySlug',
        parameters: [tenantSlugParam],
        responses: {
          200: {
            description: 'Dados da prefeitura.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Tenant' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/v1/tenants/{tenantSlug}/noticias': {
      get: {
        tags: ['Noticias'],
        summary: 'Lista as noticias publicadas de uma prefeitura',
        description:
          'Retorna apenas noticias com status `publicado`, nao deletadas e com `publicado_em` menor ou igual ao horario atual. Ordenadas da mais recente para a mais antiga.',
        operationId: 'listNoticiasByTenant',
        parameters: [
          tenantSlugParam,
          pageParam,
          perPageParam,
          {
            name: 'q',
            in: 'query',
            required: false,
            description: 'Busca textual por titulo ou resumo.',
            schema: { type: 'string', maxLength: 100, example: 'saude' },
          },
        ],
        responses: {
          200: {
            description: 'Lista paginada de noticias.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/NoticiaSummary' },
                    },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/v1/tenants/{tenantSlug}/noticias/{noticiaSlug}': {
      get: {
        tags: ['Noticias'],
        summary: 'Detalha uma noticia publicada pelo slug',
        operationId: 'getNoticiaBySlug',
        parameters: [
          tenantSlugParam,
          {
            name: 'noticiaSlug',
            in: 'path',
            required: true,
            description: 'Slug unico da noticia dentro da prefeitura.',
            schema: {
              type: 'string',
              example:
                'prefeitura-lanca-programa-de-revitalizacao-de-pracas',
            },
          },
        ],
        responses: {
          200: {
            description: 'Noticia completa, incluindo conteudo.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Noticia' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/v1/tenants/{tenantSlug}/notificacoes': {
      get: {
        tags: ['Notificacoes'],
        summary: 'Lista as notificacoes ativas de uma prefeitura',
        description:
          'Retorna apenas notificacoes com `ativo = 1`, ja enviadas (`enviado_em <= agora`) e ainda nao expiradas. Ordenadas pelo envio mais recente.',
        operationId: 'listNotificacoesByTenant',
        parameters: [
          tenantSlugParam,
          pageParam,
          perPageParam,
          {
            name: 'tipo',
            in: 'query',
            required: false,
            description: 'Filtra pelo tipo da notificacao.',
            schema: {
              type: 'string',
              enum: ['alerta', 'campanha', 'utilidade_publica', 'emergencia'],
            },
          },
        ],
        responses: {
          200: {
            description: 'Lista paginada de notificacoes ativas.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/NotificacaoSummary' },
                    },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/v1/tenants/{tenantSlug}/notificacoes/{notificacaoId}': {
      get: {
        tags: ['Notificacoes'],
        summary: 'Detalha uma notificacao ativa pelo ID',
        operationId: 'getNotificacaoById',
        parameters: [
          tenantSlugParam,
          {
            name: 'notificacaoId',
            in: 'path',
            required: true,
            description: 'UUID da notificacao.',
            schema: {
              type: 'string',
              format: 'uuid',
              example: '3870bba8-9a98-43c9-8df3-5f07ffe5a47f',
            },
          },
        ],
        responses: {
          200: {
            description: 'Notificacao ativa encontrada.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Notificacao' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },
  components: {
    schemas: {
      TenantSummary: tenantSummarySchema,
      Tenant: tenantSchema,
      NoticiaSummary: noticiaSummarySchema,
      Noticia: noticiaSchema,
      NotificacaoSummary: notificacaoSummarySchema,
      Notificacao: notificacaoSchema,
      PaginationMeta: metaSchema,
      Error: errorSchema,
    },
    responses: {
      BadRequest: {
        description: 'Parametros invalidos.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Recurso nao encontrado.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      InternalError: {
        description: 'Erro interno do servidor.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
};

module.exports = openapi;
