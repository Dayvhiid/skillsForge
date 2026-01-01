const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
    try {
        // Check if admin already exists
        const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

        if (!adminExists) {
            await Admin.create({
                name: 'Super Admin',
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: 'super-admin'
            });
            console.log('✅ Default admin account created');
            console.log(`📧 Email: ${process.env.ADMIN_EMAIL}`);
            console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD}`);
            console.log('⚠️  PLEASE CHANGE THE PASSWORD AFTER FIRST LOGIN!');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};

module.exports = seedAdmin;
