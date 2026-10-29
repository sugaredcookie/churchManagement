// backend/src/services/emailService.js
const nodemailer = require('nodemailer');
const AppError = require('../utils/AppError');

class EmailService {
  constructor() {
    // Check if email configuration exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured. Email sending will be disabled.');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development'
      });
      this.isConfigured = true;
      console.log('✅ Email service configured successfully');
    } catch (error) {
      console.error('❌ Failed to configure email service:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Send welcome email to church with temporary password
   */
  async sendWelcomeEmail(email, churchName, tempPassword) {
    // If email is not configured, log the credentials instead of sending
    if (!this.isConfigured) {
      console.log('📧 Email would be sent (email service not configured):');
      console.log(`   To: ${email}`);
      console.log(`   Subject: Welcome ${churchName} - Your Account Details`);
      console.log(`   Temporary Password: ${tempPassword}`);
      console.log(`   Login URL: ${process.env.CLIENT_URL || 'http://localhost:3002'}/login`);
      return { success: true, message: 'Email not sent (service not configured)' };
    }

    try {
      const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:3002'}/login`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to the Church Management System</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${churchName} Team,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Your church <strong>${churchName}</strong> has been successfully registered.
            You can now access the church dashboard using the credentials below.
          </p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e0e0e0; padding: 2px 8px; border-radius: 3px;">${tempPassword}</code></p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            <strong>Important:</strong> For security reasons, you will be required to change this password when you log in for the first time.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Login to Your Account
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
            If you did not register for this account, please ignore this email or contact support.
          </p>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `Welcome ${churchName} - Your Account Details`,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Welcome email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email sending error:', error.message);
      // Don't throw, just return error info
      return { success: false, error: error.message };
    }
  }

  /**
   * Send church welcome email with temporary password (alias for sendWelcomeEmail)
   */
  async sendChurchWelcomeEmail({ churchName, email, tempPassword, pastorName, loginUrl }) {
    return this.sendWelcomeEmail(email, churchName, tempPassword);
  }

  /**
   * Send member welcome email with temporary password
   */
  async sendMemberWelcomeEmail({ name, email, tempPassword, churchName, loginUrl }) {
    if (!this.isConfigured) {
      console.log('📧 Member email would be sent (email service not configured):');
      console.log(`   To: ${email}`);
      console.log(`   Subject: Welcome to ${churchName}`);
      console.log(`   Temporary Password: ${tempPassword}`);
      console.log(`   Login URL: ${loginUrl || process.env.CLIENT_URL || 'http://localhost:3002'}/login`);
      return { success: true, message: 'Email not sent (service not configured)' };
    }

    try {
      const loginUrlFinal = loginUrl || `${process.env.CLIENT_URL || 'http://localhost:3002'}/login`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to ${churchName}</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${name},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            You have been registered as a member of <strong>${churchName}</strong>.
            You can now access the member dashboard using the credentials below.
          </p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e0e0e0; padding: 2px 8px; border-radius: 3px;">${tempPassword}</code></p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            <strong>Important:</strong> For security reasons, you will be required to change this password when you log in for the first time.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrlFinal}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Login to Your Account
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
            If you did not expect this email, please ignore it or contact your church administrator.
          </p>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `Welcome to ${churchName} - Your Account Details`,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Member email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Member email sending error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail({ name, email, resetUrl }) {
    if (!this.isConfigured) {
      console.log('📧 Password reset email would be sent (email service not configured):');
      console.log(`   To: ${email}`);
      console.log(`   Reset URL: ${resetUrl}`);
      return { success: true, message: 'Email not sent (service not configured)' };
    }

    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333;">Reset Your Password</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${name || 'User'},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            You requested to reset your password. Click the button below to reset it.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            This link will expire in 1 hour. If you did not request this, please ignore this email.
          </p>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Your Password',
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Password reset email error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email to reset password confirmation
   */
  async sendPasswordChangedEmail({ name, email }) {
    if (!this.isConfigured) {
      console.log('📧 Password changed email would be sent (email service not configured):');
      console.log(`   To: ${email}`);
      return { success: true, message: 'Email not sent (service not configured)' };
    }

    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333;">Password Changed Successfully</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${name || 'User'},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Your password has been changed successfully. If you did not make this change, please contact support immediately.
          </p>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Password Changed Successfully',
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Password changed email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Password changed email error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Export a singleton instance
module.exports = new EmailService();