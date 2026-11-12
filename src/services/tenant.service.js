'use strict';

const tenantsRepository = require('../repositories/tenants.repository');
const { createHttpError } = require('../utils/httpError');

async function getTenantOrFail(slug) {
  const tenant = await tenantsRepository.findBySlug(slug);

  if (!tenant) {
    throw createHttpError(404, `Prefeitura nao encontrada para o slug "${slug}".`);
  }

  return tenant;
}

module.exports = { getTenantOrFail };
