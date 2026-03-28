const RFQ = require('../models/RFQ');
const Bid = require('../models/Bid');

/**
 * Creates a new RFQ.
 */
exports.createRFQ = async (req, res) => {
    try {
        const { name, startTime, bidCloseTime, forcedCloseTime, triggerWindow, extensionDuration, extensionTriggerType } = req.body;
        
        const rfq = await RFQ.create({
            name,
            startTime,
            bidCloseTime,
            forcedCloseTime,
            triggerWindow,
            extensionDuration,
            extensionTriggerType,
            createdBy: req.user._id
        });
        
        res.status(201).json(rfq);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * Gets all RFQs.
 */
exports.getAllRFQs = async (req, res) => {
    try {
        const rfqs = await RFQ.find().sort({ createdAt: -1 });
        res.status(200).json(rfqs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Gets a specific RFQ with bid history.
 */
exports.getRFQById = async (req, res) => {
    try {
        const rfq = await RFQ.findById(req.params.id).populate('createdBy', 'name email role');
        if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
        
        const bids = await Bid.find({ rfqId: rfq._id })
            .populate('bidder', 'name email')
            .sort({ rank: 1, createdAt: 1 });
        
        res.status(200).json({ rfq, bids });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
