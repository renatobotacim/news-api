'use strict';

const notificacoesRepository = require('../repositories/notificacoes.repository');
const tenantService = require('../services/tenant.service');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  assertSlug,
  assertUuid,
  parsePagination,
  buildMeta,
  parseNotificacaoTipo,
} = require('../utils/validation');

const index = asyncHandler(async (req, res) => {
  const tenantSlug = assertSlug(req.params.tenantSlug, 'tenantSlug');
  const pagination = parsePagination(req.query);
  const tipo = parseNotificacaoTipo(req.query);

  const tenant = await tenantService.getTenantOrFail(tenantSlug);

  const { rows, total } = await notificacoesRepository.findByTenant(tenant.id, {
    ...pagination,
    tipo,
  });

  res.json({
    data: rows,
    meta: buildMeta({ ...pagination, total }),
  });
});

const show = asyncHandler(async (req, res) => {
  const tenantSlug = assertSlug(req.params.tenantSlug, 'tenantSlug');
  const id = assertUuid(req.params.notificacaoId, 'notificacaoId');

  const tenant = await tenantService.getTenantOrFail(tenantSlug);
  const notificacao = await notificacoesRepository.findById(tenant.id, id);

  if (!notificacao) {
    res.status(404).json({
      error: {
        status: 404,
        message: 'Notificacao nao encontrada ou inativa.',
      },
    });
    return;
  }

  res.json({ data: notificacao });
});

module.exports = { index, show };
