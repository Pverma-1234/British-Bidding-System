const Bid = require('../models/Bid');
const RFQ = require('../models/RFQ');
const ActivityLog = require('../models/ActivityLog');

/**
 * Calculates total bid value based on charges.
 */
const calculateTotalBidValue = (bidData) => {
    const { freightCharges, originCharges, destinationCharges } = bidData;
    return (parseFloat(freightCharges) || 0) + (parseFloat(originCharges) || 0) + (parseFloat(destinationCharges) || 0);
};

/**
 * Updates ranks for all bids in a specific RFQ.
 * Sorts by total price ascending (British Auction).
 */
const updateRanks = async (rfqId) => {
    const bids = await Bid.find({ rfqId }).sort({ totalBidValue: 1, createdAt: 1 });
    
    let l1Changed = false;
    let rankChanged = false;
    
    for (let i = 0; i < bids.length; i++) {
        const newRank = i + 1;
        if (bids[i].rank !== newRank) {
            if (newRank === 1) l1Changed = true;
            rankChanged = true;
            bids[i].rank = newRank;
            await bids[i].save();
        }
    }
    
    return { l1Changed, rankChanged };
};

/**
 * Checks if a bid triggers an auction extension.
 */
const handleTimeExtension = async (rfq, bid, changes) => {
    const { l1Changed, rankChanged } = changes;
    const now = new Date();
    const bidCloseTime = new Date(rfq.bidCloseTime);
    const triggerWindowMs = rfq.triggerWindow * 60 * 1000;
    
    // Check if we are within the trigger window
    const timeRemaining = bidCloseTime.getTime() - now.getTime();
    
    if (timeRemaining > 0 && timeRemaining <= triggerWindowMs) {
        let shouldExtend = false;
        
        switch (rfq.extensionTriggerType) {
            case 'ANY_BID':
                shouldExtend = true;
                break;
            case 'RANK_CHANGE':
                shouldExtend = rankChanged;
                break;
            case 'L1_CHANGE':
                shouldExtend = l1Changed;
                break;
        }
        
        if (shouldExtend) {
            let newCloseTime = new Date(bidCloseTime.getTime() + rfq.extensionDuration * 60 * 1000);
            const forcedCloseTime = new Date(rfq.forcedCloseTime);
            
            // Cap to forcedCloseTime
            if (newCloseTime > forcedCloseTime) {
                newCloseTime = forcedCloseTime;
            }
            
            if (newCloseTime > bidCloseTime) {
                rfq.bidCloseTime = newCloseTime;
                await rfq.save();
                
                await ActivityLog.create({
                    rfqId: rfq._id,
                    type: 'AUCTION_EXTENDED',
                    message: `Auction extended to ${newCloseTime.toISOString()} due to ${rfq.extensionTriggerType}`,
                    details: { newCloseTime, triggerType: rfq.extensionTriggerType }
                });
                
                return true;
            }
        }
    }
    
    return false;
};

module.exports = {
    calculateTotalBidValue,
    updateRanks,
    handleTimeExtension
};
