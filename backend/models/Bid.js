const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true, index: true },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freightCharges: { type: Number, required: true },
    originCharges: { type: Number, required: true },
    destinationCharges: { type: Number, required: true },
    transitTime: { type: Number, required: true }, // in days
    quoteValidity: { type: Date, required: true },
    totalBidValue: { type: Number, required: true },
    rank: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure rfqId + supplierName uniqueness if we want to limit one active bid per supplier (optional/not requested)
// bidSchema.index({ rfqId: 1, supplierName: 1 });

module.exports = mongoose.model('Bid', bidSchema);
