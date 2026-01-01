const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    handbook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Handbook',
        required: true
    },
    lastPageRead: {
        type: Number,
        default: 1
    },
    totalTimeSpent: {
        type: Number,
        default: 0,
        comment: 'Time in minutes'
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Compound index to ensure one progress record per user per handbook
readingProgressSchema.index({ user: 1, handbook: 1 }, { unique: true });

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);
