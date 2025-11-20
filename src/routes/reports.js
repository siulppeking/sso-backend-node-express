const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { checkReportRole } = require('../middlewares/checkReportRole');

// Example report endpoint protected by REPORT role
router.get('/', authenticate, checkReportRole, async (req, res) => {
  // In a real app you'd fetch and return reports for the requesting user
  res.json({ message: 'Reports access granted', user: req.user });
});

module.exports = router;
