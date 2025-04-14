const nodemailer = require('nodemailer');
const ErrorResponse = require('./errorResponse');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message (plain text)
 * @param {string} options.html - Email message (HTML format, optional)
 * @param {Array} options.attachments - Email attachments (optional)
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Prepare email template
    const htmlContent = options.html || `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-radius: 5px;
            }
            .content {
              padding: 20px;
              background-color: #ffffff;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>E-Learning Platform</h2>
            </div>
            <div class="content">
              ${options.message}
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} E-Learning Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message, // Plain text version
      html: htmlContent // HTML version
    };

    // Add attachments if provided
    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Email sent: %s', info.messageId);
      // Preview URL for development (works with ethereal.email)
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new ErrorResponse('Email could not be sent', 500);
  }
};

// Email templates
const emailTemplates = {
  // Welcome email template
  welcome: (name) => ({
    subject: 'Welcome to E-Learning Platform',
    message: `
      <h3>Welcome ${name}!</h3>
      <p>Thank you for joining our E-Learning Platform. We're excited to have you on board!</p>
      <p>Start exploring our courses and begin your learning journey today.</p>
      <a href="${process.env.CLIENT_URL}/courses" class="button">Explore Courses</a>
    `
  }),

  // Email verification template
  verifyEmail: (name, verificationUrl) => ({
    subject: 'Verify Your Email',
    message: `
      <h3>Hello ${name},</h3>
      <p>Please verify your email address to complete your registration.</p>
      <p>This link will expire in 24 hours.</p>
      <a href="${verificationUrl}" class="button">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `
  }),

  // Password reset template
  resetPassword: (name, resetUrl) => ({
    subject: 'Password Reset Request',
    message: `
      <h3>Hello ${name},</h3>
      <p>You are receiving this email because you (or someone else) has requested to reset your password.</p>
      <p>This link will expire in 10 minutes.</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `
  }),

  // Course enrollment confirmation
  courseEnrollment: (name, courseName) => ({
    subject: `Enrolled in ${courseName}`,
    message: `
      <h3>Congratulations ${name}!</h3>
      <p>You have successfully enrolled in "${courseName}".</p>
      <p>Start learning now and track your progress in your dashboard.</p>
      <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
    `
  }),

  // Course completion certificate
  courseCompletion: (name, courseName, completionDate) => ({
    subject: `Course Completion - ${courseName}`,
    message: `
      <h3>Congratulations ${name}!</h3>
      <p>You have successfully completed "${courseName}" on ${completionDate}.</p>
      <p>Your certificate is attached to this email.</p>
      <p>Keep up the great work!</p>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};
