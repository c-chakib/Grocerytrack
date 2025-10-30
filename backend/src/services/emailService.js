// Email Service - Complete Implementation
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Send expiration alert email
   * @param {Object} user - User object
   * @param {Array} items - Array of expiring items
   */
  async sendExpirationAlert(user, items) {
    if (!user.email || items.length === 0) {
      return;
    }

    const itemsList = items
      .map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${item.category}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${new Date(item.expirationDate).toLocaleDateString()}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <span style="
              background: ${this.getStatusColor(item.status)};
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
            ">
              ${item.status.toUpperCase()}
            </span>
          </td>
        </tr>
      `)
      .join('');

    const mailOptions = {
      from: `"GroceryTrack" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '🥬 GroceryTrack Alert: Items Expiring Soon!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; background: white; margin-top: 20px; }
            th { background: #10b981; color: white; padding: 12px; text-align: left; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🥬 GroceryTrack Alert</h1>
              <p>You have ${items.length} item${items.length > 1 ? 's' : ''} expiring soon!</p>
            </div>
            <div class="content">
              <p>Hi ${user.name},</p>
              <p>This is a friendly reminder that some of your tracked grocery items are expiring soon. Take action to avoid food waste!</p>
              
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Expires On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
              
              <center>
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
                  View Dashboard
                </a>
              </center>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                <strong>💡 Tips to reduce waste:</strong><br>
                • Cook meals using expiring items<br>
                • Freeze items for later use<br>
                • Share with neighbors or friends<br>
                • Create recipes from available ingredients
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} GroceryTrack - Reduce Food Waste, Save Money</p>
              <p>You're receiving this because you enabled email notifications.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { to: user.email, items: items.length });
      return true;
    } catch (error) {
      logger.error('Email sending failed', { error: error.message, to: user.email });
      return false;
    }
  }

  /**
   * Send welcome email
   * @param {Object} user - User object
   */
  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: `"GroceryTrack" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '🎉 Welcome to GroceryTrack!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🥬 Welcome to GroceryTrack!</h1>
              <p>Start your journey to zero food waste</p>
            </div>
            <div class="content">
              <p>Hi ${user.name},</p>
              <p>Thank you for joining GroceryTrack! We're excited to help you reduce food waste and save money.</p>
              
              <h3>🚀 Get Started:</h3>
              
              <div class="feature">
                <strong>📸 Add Your First Item</strong><br>
                Start tracking groceries by adding items manually or scanning barcodes
              </div>
              
              <div class="feature">
                <strong>🤖 Smart Expiration</strong><br>
                Our AI suggests expiration dates based on item type and storage location
              </div>
              
              <div class="feature">
                <strong>🔔 Get Alerts</strong><br>
                Receive notifications before items expire (you can customize in settings)
              </div>
              
              <div class="feature">
                <strong>📊 Track Progress</strong><br>
                See how much money and food you're saving over time
              </div>
              
              <center>
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
                  Go to Dashboard
                </a>
              </center>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Need help? Reply to this email or visit our support center.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} GroceryTrack</p>
              <p>Together, let's reduce food waste! 🌱</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info('Welcome email sent', { to: user.email });
      return true;
    } catch (error) {
      logger.error('Welcome email failed', { error: error.message });
      return false;
    }
  }

  /**
   * Get status color for email
   * @param {string} status - Item status
   * @returns {string} - Color code
   */
  getStatusColor(status) {
    const colors = {
      'fresh': '#10b981',
      'expiring-soon': '#f59e0b',
      'expired': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }
}

export default new EmailService();