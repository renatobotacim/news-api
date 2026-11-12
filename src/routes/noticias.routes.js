'use strict';

const express = require('express');
const noticiasController = require('../controllers/noticias.controller');

const router = express.Router({ mergeParams: true });

router.get('/', noticiasController.index);
router.get('/:noticiaSlug', noticiasController.show);

module.exports = router;
