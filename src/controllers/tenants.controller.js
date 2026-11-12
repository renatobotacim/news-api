'use strict';

const tenantsRepository = require('../repositories/tenants.repository');
const tenantService = require('../services/tenant.service');
const { asyncHandler } = require('../utils/asyncHandler');
const { assertSlug, parsePagination, buildMeta } = require('../utils/validation');

const index = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { rows, total } = await tenantsRepository.findAll(pagination);

  res.json({
    data: rows,
    meta: buildMeta({ ...pagination, total }),
  });
});

const show = asyncHandler(async (req, res) => {
  const slug = assertSlug(req.params.tenantSlug, 'tenantSlug');
  const tenant = await tenantService.getTenantOrFail(slug);

  res.json({ data: tenant });
});

module.exports = { index, show };
