const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const ctrl = require('../controllers/admin.controller');

router.get('/overview', auth, roleCheck('admin'), ctrl.overview);

module.exports = router;

