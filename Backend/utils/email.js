const nodemailer = require('nodemailer');

// Create transporter (for now, use a mock version if no email config)
let transporter = null;

try {
    // Only create real transporter if email credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your_email@gmail.com') {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        console.log('✅ Email service configured');
    } else {
        console.log('⚠️ Email credentials not configured. Emails will be logged to console.');
    }
} catch (error) {
    console.log('⚠️ Email service not configured:', error.message);
}

const sendConfirmationEmail = async (to, subject, html) => {
    // Log email content for debugging
    console.log('\n📧 ========== EMAIL SENT (DEMO MODE) ==========');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${html.replace(/<[^>]*>/g, ' ').substring(0, 200)}...`);
    console.log('===============================================\n');

    // If real transporter is configured, send actual email
    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                html,
            });
            console.log('✅ Real email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Email send failed:', error.message);
            return false;
        }
    }
    
    // Demo mode - just log
    console.log('📧 Email would be sent in production mode');
    return true;
};

module.exports = { sendConfirmationEmail };