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
    let currentLowestBidValue = null;
    
    for (let i = 0; i < bids.length; i++) {
        const newRank = i + 1;
        if (newRank === 1) {
            currentLowestBidValue = bids[i].totalBidValue;
        }

        if (bids[i].rank !== newRank) {
            if (newRank === 1) l1Changed = true;
            rankChanged = true;
            bids[i].rank = newRank;
            await bids[i].save();
        }
    }
    
    return { l1Changed, rankChanged, currentLowestBidValue };
};

/**
 * Checks if a bid triggers an auction extension.
 */
const handleTimeExtension = async (rfq, bid, changes) => {
    const { l1Changed, rankChanged } = changes;
    const now = new Date();
    const endTime = new Date(rfq.endTime);
    const triggerWindowMs = rfq.triggerWindow * 60 * 1000;
    
    // Calculate the start time of the current trigger window
    const triggerWindowStartTime = new Date(endTime.getTime() - triggerWindowMs);
    
    // Automatically reset extensionUsedInWindow if we have entered a new trigger window 
    // and the last extension happened before this window started
    if (rfq.extensionUsedInWindow && rfq.lastExtensionTime && rfq.lastExtensionTime < triggerWindowStartTime) {
        rfq.extensionUsedInWindow = false;
    }

    const timeRemaining = endTime.getTime() - now.getTime();
    
    if (timeRemaining > 0 && timeRemaining <= triggerWindowMs) {
        // If extension already used in this specific window, ignore
        if (rfq.extensionUsedInWindow) {
            return false;
        }

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
            let newEndTime = new Date(endTime.getTime() + rfq.extensionDuration * 60 * 1000);
            const maxEndTime = new Date(rfq.maxEndTime);
            
            // Cap to maxEndTime
            if (newEndTime > maxEndTime) {
                newEndTime = maxEndTime;
            }
            
            if (newEndTime > endTime) {
                rfq.endTime = newEndTime;
                rfq.extensionUsedInWindow = true;
                rfq.lastExtensionTime = now;
                await rfq.save();
                
                await ActivityLog.create({
                    rfqId: rfq._id,
                    type: 'AUCTION_EXTENDED',
                    message: `Auction extended to ${newEndTime.toISOString()} due to ${rfq.extensionTriggerType}`,
                    details: { newEndTime, triggerType: rfq.extensionTriggerType }
                });
                
                return true;
            }
        }
    } else if (timeRemaining > triggerWindowMs && rfq.extensionUsedInWindow) {
        // Reset if we are outside the trigger window (e.g. before it starts)
        rfq.extensionUsedInWindow = false;
        await rfq.save();
    }
    
    return false;
};

module.exports = {
    calculateTotalBidValue,
    updateRanks,
    handleTimeExtension
};
