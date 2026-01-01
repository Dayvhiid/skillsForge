const mongoose = require('mongoose');

const handbookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide handbook title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    track: {
        type: String,
        required: [true, 'Please specify the track'],
        enum: ['Financial Markets', 'Web Development', 'Photography']
    },
    filePath: {
        type: String,
        required: [true, 'File path is required']
    },
    fileName: {
        type: String,
        required: true
    },
    totalPages: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Handbook', handbookSchema);
