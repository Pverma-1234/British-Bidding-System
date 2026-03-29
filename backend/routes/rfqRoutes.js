const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfqController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('BUYER'), rfqController.createRFQ);
router.get('/', protect, rfqController.getAllRFQs);
router.get('/:id', protect, rfqController.getRFQById);
router.get('/:id/logs', protect, rfqController.getActivityLogs);
router.put('/:id', protect, authorize('BUYER'), rfqController.updateRFQ);
router.delete('/:id', protect, authorize('BUYER'), rfqController.deleteRFQ);
router.post('/:id/end-early', protect, authorize('BUYER'), rfqController.endEarly);
router.post('/:id/award', protect, authorize('BUYER'), rfqController.awardBid);

module.exports = router;
