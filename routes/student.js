const express = require('express');
const router = express.Router();
const Handbook = require('../models/Handbook');
const ReadingProgress = require('../models/ReadingProgress');
const { protectStudent } = require('../middleware/auth');

// @route   GET /api/student/dashboard
// @desc    Get student dashboard data
// @access  Private (Student)
router.get('/dashboard', protectStudent, async (req, res) => {
    try {
        // Get handbooks for student's track
        const handbooks = await Handbook.find({ track: req.user.track })
            .select('title description totalPages viewCount uploadDate')
            .sort('-uploadDate');

        // Get reading progress for all handbooks
        const progressData = await ReadingProgress.find({ user: req.user._id })
            .populate('handbook', 'title');

        res.json({
            success: true,
            data: {
                student: {
                    fullName: req.user.fullName,
                    track: req.user.track,
                    registrationDate: req.user.registrationDate
                },
                handbooks,
                progress: progressData
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/student/handbooks
// @desc    Get all handbooks for student's track
// @access  Private (Student)
router.get('/handbooks', protectStudent, async (req, res) => {
    try {
        const handbooks = await Handbook.find({ track: req.user.track })
            .select('title description totalPages viewCount uploadDate')
            .sort('-uploadDate');

        res.json({
            success: true,
            count: handbooks.length,
            data: handbooks
        });
    } catch (error) {
        console.error('Get handbooks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/student/handbook/:id
// @desc    Get specific handbook details and file
// @access  Private (Student)
router.get('/handbook/:id', protectStudent, async (req, res) => {
    try {
        const handbook = await Handbook.findById(req.params.id);

        if (!handbook) {
            return res.status(404).json({
                success: false,
                message: 'Handbook not found'
            });
        }

        // Check if handbook belongs to student's track
        if (handbook.track !== req.user.track) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this handbook'
            });
        }

        // Increment view count
        handbook.viewCount += 1;
        await handbook.save();

        res.json({
            success: true,
            data: handbook
        });
    } catch (error) {
        console.error('Get handbook error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/student/progress
// @desc    Update reading progress
// @access  Private (Student)
router.post('/progress', protectStudent, async (req, res) => {
    try {
        const { handbookId, lastPageRead, timeSpent } = req.body;

        // Validate handbook exists and belongs to student's track
        const handbook = await Handbook.findById(handbookId);
        if (!handbook) {
            return res.status(404).json({
                success: false,
                message: 'Handbook not found'
            });
        }

        if (handbook.track !== req.user.track) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this handbook'
            });
        }

        // Calculate completion percentage
        const completionPercentage = handbook.totalPages > 0
            ? Math.round((lastPageRead / handbook.totalPages) * 100)
            : 0;

        // Update or create progress
        const progress = await ReadingProgress.findOneAndUpdate(
            { user: req.user._id, handbook: handbookId },
            {
                lastPageRead,
                $inc: { totalTimeSpent: timeSpent || 0 },
                lastAccessed: Date.now(),
                completionPercentage
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Progress updated',
            data: progress
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/student/progress/:handbookId
// @desc    Get reading progress for a specific handbook
// @access  Private (Student)
router.get('/progress/:handbookId', protectStudent, async (req, res) => {
    try {
        const progress = await ReadingProgress.findOne({
            user: req.user._id,
            handbook: req.params.handbookId
        }).populate('handbook', 'title totalPages');

        if (!progress) {
            return res.json({
                success: true,
                data: null,
                message: 'No progress found for this handbook'
            });
        }

        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
