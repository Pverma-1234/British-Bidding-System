const mongoose = require('mongoose');
const RFQ = require('./models/RFQ');
const Bid = require('./models/Bid');

const MONGO_URI = 'mongodb://admin:Ginno%404321@ac-sczpyyy-shard-00-00.zqeysch.mongodb.net:27017,ac-sczpyyy-shard-00-01.zqeysch.mongodb.net:27017,ac-sczpyyy-shard-00-02.zqeysch.mongodb.net:27017/?ssl=true&replicaSet=atlas-lmtfee-shard-0&authSource=admin&appName=LPU-Cluster';

async function testAnalytics() {
    await mongoose.connect(MONGO_URI);
    const rfqs = await RFQ.find();
    const bids = await Bid.find();

    let totalSavings = 0;
    const logs = [];

    for (const rfq of rfqs) {
        const rfqBids = bids.filter(b => b.rfqId.toString() === rfq._id.toString());
        const isExtended = !!rfq.lastExtensionTime;
        
        const logEntry = {
            id: rfq._id,
            name: rfq.name,
            isExtended,
            initialEndTime: rfq.initialEndTime,
            lastExtensionTime: rfq.lastExtensionTime,
            bidsCount: rfqBids.length,
            savingsCalculated: 0,
            reason: ""
        };

        if (isExtended) {
            const baselineEndTime = rfq.initialEndTime; 
            if (baselineEndTime) {
                const beforeInit = rfqBids.filter(b => new Date(b.createdAt) <= new Date(baselineEndTime));
                logEntry.bidsBeforeInitialEndTime = beforeInit.length;
                
                const sortedAll = [...rfqBids].sort((a,b) => a.totalBidValue - b.totalBidValue);
                const latestBid = sortedAll[0];
                
                if (beforeInit.length > 0 && latestBid) {
                    const sortedBefore = [...beforeInit].sort((a,b) => a.totalBidValue - b.totalBidValue);
                    const initLowest = sortedBefore[0];
                    logEntry.initLowest = initLowest.totalBidValue;
                    logEntry.overallLowest = latestBid.totalBidValue;
                    
                    if (initLowest.totalBidValue > latestBid.totalBidValue) {
                        const savings = (initLowest.totalBidValue - latestBid.totalBidValue);
                        totalSavings += savings;
                        logEntry.savingsCalculated = savings;
                        logEntry.reason = "Savings found!";
                    } else {
                        logEntry.reason = "Lowest bid before extension is NOT greater than lowest bid overall";
                    }
                } else {
                    logEntry.reason = "Either no bids before init time, or no bids overall";
                }
            } else {
                logEntry.reason = "No initialEndTime set on RFQ";
            }
        } else {
             logEntry.reason = "Not extended";
        }
        logs.push(logEntry);
    }

    console.log(JSON.stringify({logs, totalSavings}, null, 2));
    process.exit(0);
}

testAnalytics().catch(console.error);
