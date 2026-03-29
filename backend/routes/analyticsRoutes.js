const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/rfq-metrics', protect, analyticsController.getMetrics);

module.exports = router;
