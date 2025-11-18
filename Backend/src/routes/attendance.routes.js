const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const ctrl = require('../controllers/attendance.controller');

router.post('/punch', auth, ctrl.punch);
router.post('/leave', auth, ctrl.requestLeave);
router.post('/status', auth, ctrl.setStatus);
router.get('/', auth, roleCheck('admin'), ctrl.all);
router.get('/me', auth, ctrl.me);
router.get('/:userId', auth, roleCheck(['manager','admin']), ctrl.forUser);
router.post('/manual', auth, roleCheck('admin'), ctrl.manual);

module.exports = router;
