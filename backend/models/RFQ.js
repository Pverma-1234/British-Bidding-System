const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: Date, required: true },
    bidCloseTime: { type: Date, required: true },
    forcedCloseTime: { type: Date, required: true },
    triggerWindow: { type: Number, required: true }, // in minutes
    extensionDuration: { type: Number, required: true }, // in minutes
    extensionTriggerType: {
        type: String,
        enum: ['ANY_BID', 'RANK_CHANGE', 'L1_CHANGE'],
        required: true
    },
    // 🆕 Track extensions
    extensionCount: {
        type: Number,
        default: 0
    },

    // 🆕 Track last extension time
    lastExtendedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['DRAFT', 'ACTIVE', 'CLOSED'],
        default: 'ACTIVE'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    allowedBidders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('RFQ', rfqSchema);
