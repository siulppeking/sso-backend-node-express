const express = require('express');
const router = express.Router();
const { me, addRole, removeRole } = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');

router.get('/me', authenticate, me);

// Admin endpoints to manage roles on users
router.post('/:id/roles', authenticate, requireAdmin, addRole);
router.delete('/:id/roles/:role', authenticate, requireAdmin, removeRole);

module.exports = router;
