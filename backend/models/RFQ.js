const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    initialEndTime: { type: Date },
    maxEndTime: { type: Date, required: true },
    triggerWindow: { type: Number, required: true }, // in minutes
    extensionDuration: { type: Number, required: true }, // in minutes
    extensionTriggerType: {
        type: String,
        enum: ['ANY_BID', 'RANK_CHANGE', 'L1_CHANGE'],
        required: true
    },
    // 🆕 Logistics
    pickupLocation: { type: String, required: true },
    dropLocation: { type: String, required: true },
    serviceDate: { type: Date, default: Date.now },
    // 🆕 Track extensions properly
    extensionUsedInWindow: { type: Boolean, default: false },
    lastExtensionTime: { type: Date },
    currentLowestBid: { type: Number },
    bidHistory: [{
        bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    endedEarly: { type: Boolean, default: false },
    selectedBidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['DRAFT', 'ACTIVE', 'CLOSED', 'ENDED', 'AWARDED', 'UPCOMING', 'LIVE'],
        default: 'UPCOMING'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    allowedBidders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('RFQ', rfqSchema);
