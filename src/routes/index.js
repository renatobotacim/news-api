'use strict';

const express = require('express');
const healthController = require('../controllers/health.controller');
const tenantsRoutes = require('./tenants.routes');

const router = express.Router();

router.get('/health', healthController.check);
router.use('/', tenantsRoutes);

module.exports = router;
