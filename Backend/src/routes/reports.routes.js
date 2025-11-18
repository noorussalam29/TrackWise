const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const ctrl = require('../controllers/reports.controller');

router.post('/daily', auth, ctrl.createDaily);
router.get('/:userId', auth, ctrl.list);
router.get('/admin/overview', auth, roleCheck('admin'), ctrl.overview);

module.exports = router;

