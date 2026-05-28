const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(email, churchName, password) {
    const subject = 'Welcome to Church Management System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Welcome ${churchName}!</h2>
        <p>Your church account has been successfully created.</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Login Credentials</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> <span style="background-color: #edf2f7; padding: 4px 8px; border-radius: 4px;">${password}</span></p>
        </div>
        <p style="color: #718096;">Please change your password after first login for security purposes.</p>
        <p style="margin-top: 30px; color: #a0aec0; font-size: 14px;">Best regards,<br>Church Management Team</p>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();