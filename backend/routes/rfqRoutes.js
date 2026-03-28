const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfqController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('BUYER'), rfqController.createRFQ);
router.get('/', protect, rfqController.getAllRFQs);
router.get('/:id', protect, rfqController.getRFQById);

module.exports = router;
