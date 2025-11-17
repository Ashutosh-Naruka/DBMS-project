const express = require('express');
const router = express.Router();
const {
  getDailySales,
  getTopItems,
  getHourlyDemand
} = require('../controllers/reportsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/daily-sales', protect, authorize('admin', 'staff'), getDailySales);
router.get('/top-items', protect, authorize('admin', 'staff'), getTopItems);
router.get('/hourly-demand', protect, authorize('admin', 'staff'), getHourlyDemand);

module.exports = router;
