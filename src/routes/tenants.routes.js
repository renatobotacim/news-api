'use strict';

const express = require('express');
const tenantsController = require('../controllers/tenants.controller');
const noticiasRoutes = require('./noticias.routes');
const notificacoesRoutes = require('./notificacoes.routes');

const router = express.Router();

router.get('/tenants', tenantsController.index);

router.use('/tenants/:tenantSlug/noticias', noticiasRoutes);
router.use('/tenants/:tenantSlug/notificacoes', notificacoesRoutes);

router.get('/tenants/:tenantSlug', tenantsController.show);

module.exports = router;
