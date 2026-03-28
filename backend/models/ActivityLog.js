const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true, index: true },
    type: {
        type: String,
        enum: ['BID_PLACED', 'AUCTION_EXTENDED', 'RANK_UPDATE'],
        required: true
    },
    message: { type: String, required: true },
    details: { type: Object },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
