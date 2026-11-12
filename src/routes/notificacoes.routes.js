'use strict';

const express = require('express');
const notificacoesController = require('../controllers/notificacoes.controller');

const router = express.Router({ mergeParams: true });

router.get('/', notificacoesController.index);
router.get('/:notificacaoId', notificacoesController.show);

module.exports = router;
