const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const ctrl = require('../controllers/employees.controller');

router.get('/', auth, ctrl.list);
router.post('/', auth, roleCheck('admin'), ctrl.create);
router.get('/:id', auth, ctrl.get);
router.put('/:id', auth, roleCheck('admin'), ctrl.update);
router.delete('/:id', auth, roleCheck('admin'), ctrl.delete);

module.exports = router;

