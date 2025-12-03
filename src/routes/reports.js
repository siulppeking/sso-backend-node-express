const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { checkReportRole } = require('../middlewares/checkReportRole');
const { body } = require('express-validator');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const reportController = require('../controllers/reportController');

// List reports (pagination, search, tag) - requires REPORT role
router.get('/', authenticate, checkReportRole, reportController.listReports);

// Get single report - requires REPORT role
router.get('/:id', authenticate, checkReportRole, reportController.getReport);

// Create report - requires REPORT role
router.post(
	'/',
	authenticate,
	checkReportRole,
	[body('title').isString().isLength({ min: 3 }), body('content').optional().isString()],
	reportController.createReport
);

// Delete report - admin only
router.delete('/:id', authenticate, requireAdmin, reportController.deleteReport);

module.exports = router;
