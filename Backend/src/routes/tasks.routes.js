const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/tasks.controller');

router.get('/', auth, ctrl.list);
router.post('/', auth, ctrl.create);
router.get('/:id', auth, ctrl.get);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.delete);
router.post('/:id/comment', auth, ctrl.addComment);

module.exports = router;

