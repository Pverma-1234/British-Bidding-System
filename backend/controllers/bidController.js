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
        const endTime = new Date(rfq.endTime);
        const maxEndTime = new Date(rfq.maxEndTime);
        const startTime = new Date(rfq.startTime);
        
        if (now >= startTime && now < endTime) {
            rfq.status = 'LIVE';
            // await rfq.save(); // Avoid unnecessary concurrent saves since we save at the end, but state is updated in memory for the next line
        }

        // Check if auction is upcoming or not live
        if (Date.now() < new Date(rfq.startTime).getTime() || rfq.status !== 'LIVE') {
            return res.status(400).json({ message: 'Bidding is not allowed before auction starts' });
        }
        
        // Check if auction is closed
        if (now > endTime || now > maxEndTime) {
            return res.status(400).json({ message: 'Auction is closed' });
        }
        
        // Calculate total bid value
        const totalBidValue = auctionService.calculateTotalBidValue({
            freightCharges, originCharges, destinationCharges
        });
        
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
        const { l1Changed, rankChanged, currentLowestBidValue } = await auctionService.updateRanks(rfqId);
        
        // Handle Time Extension
        const wasExtended = await auctionService.handleTimeExtension(rfq, bid, { l1Changed, rankChanged });
        
        // Update bidHistory and L1 on RFQ Model
        rfq.bidHistory.push({ bidderId: req.user._id, amount: totalBidValue });
        if (currentLowestBidValue) rfq.currentLowestBid = currentLowestBidValue;
        await rfq.save();
        
        // Emit events via Socket.IO (will be handled in server.js/socket.js)
        if (req.app.get('io')) {
            const io = req.app.get('io');
            io.to(rfqId).emit('NEW_BID', { bid, totalBidValue });
            if (rankChanged) io.to(rfqId).emit('rank_update', { rfqId });
            if (wasExtended) {
                io.to(rfqId).emit('TIMER_EXTENDED', { rfqId, newCloseTime: rfq.endTime });
                io.to(rfqId).emit('RFQ_TIMER_UPDATE', { rfqId, endTime: rfq.endTime });
            }
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
