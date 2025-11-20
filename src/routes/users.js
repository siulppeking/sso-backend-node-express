const express = require('express');
const router = express.Router();
const { me, addRole, removeRole } = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.get('/me', authenticate, me);

// Admin endpoints to manage roles on users
router.post('/:id/roles', authenticate, requireRole('admin'), addRole);
router.delete('/:id/roles/:role', authenticate, requireRole('admin'), removeRole);

module.exports = router;
