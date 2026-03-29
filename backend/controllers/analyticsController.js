const RFQ = require('../models/RFQ');
const Bid = require('../models/Bid');
const ActivityLog = require('../models/ActivityLog');

exports.getMetrics = async (req, res) => {
    try {
        const rfqs = await RFQ.find();
        const bids = await Bid.find();

        const totalRFQs = rfqs.length;
        const totalBids = bids.length;
        const avgBidsPerRFQ = totalRFQs > 0 ? (totalBids / totalRFQs).toFixed(1) : 0;

        let extendedRFQsCount = 0;
        let nonExtendedRFQsCount = 0;
        let bidsInExtended = 0;
        let bidsInNonExtended = 0;

        let totalSavings = 0;

        for (const rfq of rfqs) {
            const rfqBids = bids.filter(b => b.rfqId.toString() === rfq._id.toString());
            const isExtended = !!rfq.lastExtensionTime;
            
            if (isExtended) {
                extendedRFQsCount++;
                bidsInExtended += rfqBids.length;
                
                // Calculate Savings
                // Baseline is initialEndTime. If missing, we can't accurately calculate savings for legacy RFQs.
                const baselineEndTime = rfq.initialEndTime; 
                if (baselineEndTime) {
                    const beforeInit = rfqBids.filter(b => new Date(b.createdAt) <= new Date(baselineEndTime));
                    const latestBid = rfqBids.sort((a,b) => a.totalBidValue - b.totalBidValue)[0];
                    if (beforeInit.length > 0 && latestBid) {
                        const initLowest = beforeInit.sort((a,b) => a.totalBidValue - b.totalBidValue)[0];
                        if (initLowest.totalBidValue > latestBid.totalBidValue) {
                            totalSavings += (initLowest.totalBidValue - latestBid.totalBidValue);
                        }
                    }
                }
            } else {
                nonExtendedRFQsCount++;
                bidsInNonExtended += rfqBids.length;
            }
        }

        const avgBidsExtended = extendedRFQsCount > 0 ? (bidsInExtended / extendedRFQsCount).toFixed(1) : 0;
        const avgBidsNonExtended = nonExtendedRFQsCount > 0 ? (bidsInNonExtended / nonExtendedRFQsCount).toFixed(1) : 0;

        res.status(200).json({
            totalRFQs,
            totalBids,
            avgBidsPerRFQ,
            extendedStats: {
                count: extendedRFQsCount,
                avgBids: avgBidsExtended
            },
            nonExtendedStats: {
                count: nonExtendedRFQsCount,
                avgBids: avgBidsNonExtended
            },
            totalSavings: totalSavings.toFixed(2),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
