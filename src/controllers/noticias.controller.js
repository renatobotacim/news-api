'use strict';

const noticiasRepository = require('../repositories/noticias.repository');
const tenantService = require('../services/tenant.service');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  assertSlug,
  parsePagination,
  buildMeta,
  parseSearch,
} = require('../utils/validation');

const index = asyncHandler(async (req, res) => {
  const tenantSlug = assertSlug(req.params.tenantSlug, 'tenantSlug');
  const pagination = parsePagination(req.query);
  const search = parseSearch(req.query);

  const tenant = await tenantService.getTenantOrFail(tenantSlug);

  const { rows, total } = await noticiasRepository.findByTenant(tenant.id, {
    ...pagination,
    search,
  });

  res.json({
    data: rows,
    meta: buildMeta({ ...pagination, total }),
  });
});

const show = asyncHandler(async (req, res) => {
  const tenantSlug = assertSlug(req.params.tenantSlug, 'tenantSlug');
  const noticiaSlug = assertSlug(req.params.noticiaSlug, 'noticiaSlug');

  const tenant = await tenantService.getTenantOrFail(tenantSlug);
  const noticia = await noticiasRepository.findBySlug(tenant.id, noticiaSlug);

  if (!noticia) {
    res.status(404).json({
      error: {
        status: 404,
        message: 'Noticia nao encontrada.',
      },
    });
    return;
  }

  res.json({ data: noticia });
});

module.exports = { index, show };
