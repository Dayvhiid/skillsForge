const Visitor = require('../models/Visitor');

/**
 * Middleware to track site visits
 */
const trackVisitor = async (req, res, next) => {
    // Skip tracking for API requests that aren't landing/portal related if needed
    // But usually we want to track any entry to the site

    // Skip static files if needed, but Express is usually serving them before this or via static middleware
    // We mainly care about the main routes

    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    try {
        // Try to find visitor by IP
        let visitor = await Visitor.findOne({ ip });

        if (visitor) {
            // Repeat visitor
            visitor.visitCount += 1;
            visitor.lastVisited = Date.now();
            visitor.userAgent = userAgent; // Update in case they changed browser
            await visitor.save();
        } else {
            // New unique visitor
            await Visitor.create({
                ip,
                userAgent
            });
        }
    } catch (error) {
        console.error('Visitor tracking error:', error);
        // Don't block the request if tracking fails
    }

    next();
};

module.exports = trackVisitor;
