const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Handbook = require('../models/Handbook');
const ReadingProgress = require('../models/ReadingProgress');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs').promises;
const path = require('path');

// Generate JWT Token
const generateToken = (id, type) => {
    return jwt.sign(
        { id, type },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// @route   POST /api/admin/login
// @desc    Login admin
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find admin and include password
        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(admin._id, 'admin');

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/admin/students
// @desc    Get all students with filters
// @access  Private (Admin)
router.get('/students', protectAdmin, async (req, res) => {
    try {
        const { track, status, search } = req.query;

        let query = {};

        // Apply filters
        if (track) query.track = track;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const students = await User.find(query)
            .select('-password')
            .sort('-registrationDate');

        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/students/:id
// @desc    Get single student details
// @access  Private (Admin)
router.get('/students/:id', protectAdmin, async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get student's reading progress
        const progress = await ReadingProgress.find({ user: student._id })
            .populate('handbook', 'title track');

        res.json({
            success: true,
            data: {
                student,
                progress
            }
        });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/admin/students/:id
// @desc    Update student status
// @access  Private (Admin)
router.put('/students/:id', protectAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const student = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).select('-password');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student status updated',
            data: student
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/admin/students/:id
// @desc    Delete student
// @access  Private (Admin)
router.delete('/students/:id', protectAdmin, async (req, res) => {
    try {
        const student = await User.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Delete associated reading progress
        await ReadingProgress.deleteMany({ user: student._id });

        // Delete student
        await student.deleteOne();

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/admin/handbooks
// @desc    Upload new handbook
// @access  Private (Admin)
router.post('/handbooks', protectAdmin, upload.single('handbook'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            });
        }

        const { title, description, track, totalPages } = req.body;

        // Validate required fields
        if (!title || !track) {
            // Delete uploaded file if validation fails
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Title and track are required'
            });
        }

        // Create handbook record
        const handbook = await Handbook.create({
            title,
            description,
            track,
            filePath: req.file.path,
            fileName: req.file.filename,
            totalPages: totalPages || 0
        });

        res.status(201).json({
            success: true,
            message: 'Handbook uploaded successfully',
            data: handbook
        });
    } catch (error) {
        console.error('Upload handbook error:', error);
        // Delete uploaded file on error
        if (req.file) {
            await fs.unlink(req.file.path).catch(err => console.error('File delete error:', err));
        }
        res.status(500).json({
            success: false,
            message: 'Server error during upload'
        });
    }
});

// @route   GET /api/admin/handbooks
// @desc    Get all handbooks
// @access  Private (Admin)
router.get('/handbooks', protectAdmin, async (req, res) => {
    try {
        const { track } = req.query;

        let query = {};
        if (track) query.track = track;

        const handbooks = await Handbook.find(query).sort('-uploadDate');

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

// @route   PUT /api/admin/handbooks/:id
// @desc    Update handbook details
// @access  Private (Admin)
router.put('/handbooks/:id', protectAdmin, async (req, res) => {
    try {
        const { title, description, totalPages } = req.body;

        const handbook = await Handbook.findByIdAndUpdate(
            req.params.id,
            { title, description, totalPages },
            { new: true, runValidators: true }
        );

        if (!handbook) {
            return res.status(404).json({
                success: false,
                message: 'Handbook not found'
            });
        }

        res.json({
            success: true,
            message: 'Handbook updated successfully',
            data: handbook
        });
    } catch (error) {
        console.error('Update handbook error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/admin/handbooks/:id
// @desc    Delete handbook
// @access  Private (Admin)
router.delete('/handbooks/:id', protectAdmin, async (req, res) => {
    try {
        const handbook = await Handbook.findById(req.params.id);

        if (!handbook) {
            return res.status(404).json({
                success: false,
                message: 'Handbook not found'
            });
        }

        // Delete file from filesystem
        await fs.unlink(handbook.filePath).catch(err => console.error('File delete error:', err));

        // Delete associated reading progress
        await ReadingProgress.deleteMany({ handbook: handbook._id });

        // Delete handbook record
        await handbook.deleteOne();

        res.json({
            success: true,
            message: 'Handbook deleted successfully'
        });
    } catch (error) {
        console.error('Delete handbook error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin)
router.get('/analytics', protectAdmin, async (req, res) => {
    try {
        // Total students
        const totalStudents = await User.countDocuments();

        // Students by track
        const studentsByTrack = await User.aggregate([
            { $group: { _id: '$track', count: { $sum: 1 } } }
        ]);

        // Total handbooks
        const totalHandbooks = await Handbook.countDocuments();

        // Recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentRegistrations = await User.countDocuments({
            registrationDate: { $gte: thirtyDaysAgo }
        });

        // Active students (logged in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeStudents = await User.countDocuments({
            lastLogin: { $gte: sevenDaysAgo }
        });

        // Total handbook views
        const handbookStats = await Handbook.aggregate([
            { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
        ]);

        // Registrations over time (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const registrationsTrend = await User.aggregate([
            { $match: { registrationDate: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$registrationDate' },
                        month: { $month: '$registrationDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalStudents,
                studentsByTrack,
                totalHandbooks,
                recentRegistrations,
                activeStudents,
                totalHandbookViews: handbookStats[0]?.totalViews || 0,
                registrationsTrend
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
