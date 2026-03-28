const Bid = require('../models/Bid');
const RFQ = require('../models/RFQ');
const ActivityLog = require('../models/ActivityLog');
const auctionService = require('../services/auctionService');

/**
 * Places a bid on an RFQ.
 */
exports.placeBid = async (req, res) => {
    try {
        const { rfqId } = req.params;
        const { freightCharges, originCharges, destinationCharges, transitTime, quoteValidity } = req.body;
        
        const rfq = await RFQ.findById(rfqId);
        if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
        
        const now = new Date();
        const bidCloseTime = new Date(rfq.bidCloseTime);
        const forcedCloseTime = new Date(rfq.forcedCloseTime);
        
        // Check if auction is active
        if (now > bidCloseTime || now > forcedCloseTime) {
            return res.status(400).json({ message: 'Auction is closed' });
        }
        
        // Calculate total bid value
        const totalBidValue = auctionService.calculateTotalBidValue({
            freightCharges, originCharges, destinationCharges
        });
        
        // (Optional) Check if bid is valid (e.g. lower than current lowest if required)
        // For this demo, we'll allow all bids and rank them.
        
        const bid = await Bid.create({
            rfqId,
            bidder: req.user._id,
            freightCharges,
            originCharges,
            destinationCharges,
            transitTime,
            quoteValidity,
            totalBidValue
        });
        
        // Log activity
        await ActivityLog.create({
            rfqId,
            type: 'BID_PLACED',
            message: `Bid of ${totalBidValue} placed by ${req.user.name}`,
            details: { bidId: bid._id, totalBidValue, bidder: req.user._id }
        });
        
        // Update Ranks
        const { l1Changed, rankChanged } = await auctionService.updateRanks(rfqId);
        
        // Handle Time Extension
        const wasExtended = await auctionService.handleTimeExtension(rfq, bid, { l1Changed, rankChanged });
        
        // Emit events via Socket.IO (will be handled in server.js/socket.js)
        if (req.app.get('io')) {
            const io = req.app.get('io');
            io.to(rfqId).emit('new_bid', { bid, totalBidValue });
            if (rankChanged) io.to(rfqId).emit('rank_update', { rfqId });
            if (wasExtended) io.to(rfqId).emit('auction_extended', { rfqId, newCloseTime: rfq.bidCloseTime });
        }
        
        res.status(201).json({ bid, wasExtended });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * Gets all bids for an RFQ.
 */
exports.getBidsByRFQ = async (req, res) => {
    try {
        const bids = await Bid.find({ rfqId: req.params.rfqId }).sort({ rank: 1, createdAt: 1 });
        res.status(200).json(bids);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
