const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userAgent: String,
    visitCount: {
        type: Number,
        default: 1
    },
    firstVisited: {
        type: Date,
        default: Date.now
    },
    lastVisited: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Static methods for global stats
visitorSchema.statics.getGlobalStats = async function () {
    const uniqueVisitors = await this.countDocuments();
    const totalVisitsResult = await this.aggregate([
        { $group: { _id: null, total: { $sum: "$visitCount" } } }
    ]);
    const totalVisits = totalVisitsResult[0] ? totalVisitsResult[0].total : 0;

    return {
        uniqueVisitors,
        totalVisits
    };
};

module.exports = mongoose.model('Visitor', visitorSchema);
