const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:rfqId', protect, authorize('BIDDER'), bidController.placeBid);
router.get('/:rfqId', protect, bidController.getBidsByRFQ);

module.exports = router;
