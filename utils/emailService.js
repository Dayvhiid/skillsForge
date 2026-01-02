const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    if (process.env.EMAIL_ENABLED === 'false') {
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.log('📧 Email service disabled - skipping welcome email');
        return;
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Welcome to SkillForge Free Academy!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #050B18;">Welcome to SkillForge Free Academy!</h2>
          <p>Hi ${user.fullName},</p>
          <p>Thank you for registering for the <strong>${user.track}</strong> track.</p>
          <p>You can now access your exclusive handbooks by logging into your student portal.</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.APP_URL || 'https://skillsforge-l9zf.onrender.com'}/login.html" 
               style="background-color: #D4AF37; color: #050B18; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Access Your Portal
            </a>
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Best regards,<br>
            The SkillForge Team
          </p>
        </div>
      `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (error) {
        console.error('❌ Error sending welcome email:', error.message);
    }
};

module.exports = {
    sendWelcomeEmail
};
