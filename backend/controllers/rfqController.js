const RFQ = require('../models/RFQ');
const Bid = require('../models/Bid');

/**
 * Creates a new RFQ.
 */
exports.createRFQ = async (req, res) => {
    try {
        const { 
            name, startTime, endTime, maxEndTime, 
            triggerWindow, extensionDuration, extensionTriggerType,
            pickupLocation, dropLocation, serviceDate
        } = req.body;
        
        const start = new Date(startTime);
        const calcEndTime = new Date(endTime);
        const calcMaxEndTime = new Date(maxEndTime);

        if (start >= calcEndTime) {
            return res.status(400).json({ message: "End Time must be after Start Time." });
        }
        
        if (start >= calcMaxEndTime) {
            return res.status(400).json({ message: "Max End Time must be after Start Time." });
        }

        if (calcEndTime > calcMaxEndTime) {
            return res.status(400).json({ message: "Max End Time must be at or after End Time." });
        }

        if (triggerWindow > 0 && extensionDuration > 0) {
            const minForcedClose = new Date(calcEndTime.getTime() + extensionDuration * 60000);
            if (minForcedClose > calcMaxEndTime) {
                return res.status(400).json({ message: "Max End Time must allow at least one full extension duration after End Time." });
            }
        }

        const rfq = await RFQ.create({
            name,
            startTime,
            endTime,
            initialEndTime: endTime,
            maxEndTime,
            triggerWindow,
            extensionDuration,
            extensionTriggerType,
            pickupLocation,
            dropLocation,
            serviceDate,
            createdBy: req.user._id
        });
        
        res.status(201).json(rfq);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const syncRFQStatuses = async () => {
    const now = new Date();
    try {
        await RFQ.updateMany(
            { status: { $nin: ['AWARDED', 'ENDED'] }, endTime: { $lte: now } },
            { $set: { status: 'ENDED' } }
        );
        await RFQ.updateMany(
            { status: { $nin: ['AWARDED', 'ENDED'] }, startTime: { $lte: now }, endTime: { $gt: now } },
            { $set: { status: 'LIVE' } }
        );
        await RFQ.updateMany(
            { status: { $nin: ['AWARDED', 'ENDED'] }, startTime: { $gt: now } },
            { $set: { status: 'UPCOMING' } }
        );
    } catch (err) {
        console.error('Error syncing RFQ statuses:', err);
    }
};

/**
 * Gets all RFQs.
 */
exports.getAllRFQs = async (req, res) => {
    try {
        await syncRFQStatuses();
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
        await syncRFQStatuses();
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

/**
 * Updates an RFQ if not yet started.
 */
exports.updateRFQ = async (req, res) => {
    try {
        const rfq = await RFQ.findById(req.params.id);
        if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
        
        if (rfq.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this RFQ' });
        }
        
        if (new Date() >= new Date(rfq.startTime)) {
            return res.status(400).json({ message: 'Cannot edit RFQ after it has started' });
        }

        const { 
            name, startTime, endTime, maxEndTime, 
            triggerWindow, extensionDuration, extensionTriggerType,
            pickupLocation, dropLocation, serviceDate
        } = req.body;
        
        const start = new Date(startTime);
        const calcEndTime = new Date(endTime);
        const calcMaxEndTime = new Date(maxEndTime);

        if (start >= calcEndTime) {
            return res.status(400).json({ message: "End Time must be after Start Time." });
        }

        if (start >= calcMaxEndTime) {
            return res.status(400).json({ message: "Max End Time must be after Start Time." });
        }

        if (calcEndTime > calcMaxEndTime) {
            return res.status(400).json({ message: "Max End Time must be at or after End Time." });
        }

        if (triggerWindow > 0 && extensionDuration > 0) {
            const minForcedClose = new Date(calcEndTime.getTime() + extensionDuration * 60000);
            if (minForcedClose > calcMaxEndTime) {
                return res.status(400).json({ message: "Max End Time must allow at least one full extension duration after End Time." });
            }
        }

        rfq.name = name;
        rfq.startTime = startTime;
        rfq.endTime = endTime;
        rfq.maxEndTime = maxEndTime;
        rfq.triggerWindow = triggerWindow;
        rfq.extensionDuration = extensionDuration;
        rfq.extensionTriggerType = extensionTriggerType;
        rfq.pickupLocation = pickupLocation;
        rfq.dropLocation = dropLocation;
        if (serviceDate) rfq.serviceDate = serviceDate;

        await rfq.save();
        res.status(200).json(rfq);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * Deletes an RFQ if not yet started.
 */
exports.deleteRFQ = async (req, res) => {
    try {
        const rfq = await RFQ.findById(req.params.id);
        if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
        
        if (req.user.role?.toLowerCase() !== 'buyer') {
            return res.status(403).json({ message: 'Only buyers can delete RFQs' });
        }
        
        if (rfq.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own RFQ' });
        }
        
        if (rfq.status === 'AWARDED') {
            return res.status(400).json({ message: 'Cannot delete an awarded RFQ' });
        }

        await Bid.deleteMany({ rfqId: rfq._id });
        await rfq.deleteOne();
        
        if (req.app.get('io')) {
            const io = req.app.get('io');
            io.emit('RFQ_DELETED', { rfqId: rfq._id });
        }
        
        res.status(200).json({ message: 'RFQ removed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Ends an active RFQ early.
 */
exports.endEarly = async (req, res) => {
    try {
        const rfq = await RFQ.findById(req.params.id);
        if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
        
        if (rfq.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to end this RFQ' });
        }
        
        const now = new Date();
        if (now < new Date(rfq.startTime)) {
            return res.status(400).json({ message: 'Cannot end RFQ before it has started' });
        }
        
        if (now > new Date(rfq.endTime) || rfq.status === 'ENDED' || rfq.status === 'AWARDED') {
            return res.status(400).json({ message: 'RFQ is already ended or awarded' });
        }
        
        rfq.endTime = now;
        rfq.status = 'ENDED';
        rfq.endedEarly = true;
        await rfq.save();
        
        // Notify via Websocket
        if (req.app.get('io')) {
            const io = req.app.get('io');
            io.to(rfq._id.toString()).emit('RFQ_ENDED_EARLY', {
                rfqId: rfq._id,
                endedAt: now,
                endedEarly: true
            });
        }
        
        res.status(200).json({ message: 'Auction ended early successfully', rfq });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Awards the RFQ contract to a specific bidder.
 */
exports.awardBid = async (req, res) => {
    try {
        const { bidderId } = req.body;
        const rfq = await RFQ.findById(req.params.id);
        if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
        
        if (rfq.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to award this RFQ' });
        }
        
        if (new Date() <= new Date(rfq.endTime) && rfq.status !== 'ENDED') {
            return res.status(400).json({ message: 'Cannot award RFQ before it has officially ended' });
        }
        
        if (rfq.status === 'AWARDED') {
            return res.status(400).json({ message: 'RFQ is already awarded' });
        }
        
        rfq.status = 'AWARDED';
        rfq.selectedBidderId = bidderId;
        await rfq.save();
        
        const bids = await Bid.find({ rfqId: rfq._id });
        const uniqueBidderIds = [...new Set(bids.map(b => b.bidder.toString()))];
        
        if (req.app.get('io')) {
            const io = req.app.get('io');
            uniqueBidderIds.forEach(id => {
                 io.to(id).emit('BID_AWARDED', {
                     rfqId: rfq._id,
                     rfqName: rfq.name,
                     winnerId: bidderId
                 });
            });
            io.to(rfq._id.toString()).emit('RFQ_STATUS_CHANGED', { status: 'AWARDED' });
        }
        
        res.status(200).json({ message: 'Contract awarded successfully', rfq });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Gets all activity logs for an RFQ
 */
exports.getActivityLogs = async (req, res) => {
    try {
        const ActivityLog = require('../models/ActivityLog');
        const logs = await ActivityLog.find({ rfqId: req.params.id })
            .sort({ createdAt: -1 }); // newest first
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
