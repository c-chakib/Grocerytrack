// Notification Service - Complete Implementation with Cron Jobs
import cron from 'node-cron';
import Grocery from '../models/Grocery.js';
import User from '../models/User.js';
import emailService from './emailService.js';
import { logger } from '../utils/logger.js';

class NotificationService {
  /**
   * Initialize notification cron jobs
   */
  initializeCronJobs() {
    // Run every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
      logger.info('Starting daily expiration check...');
      await this.checkExpiringItems();
    });

    // Run every hour to check critically expiring items
    cron.schedule('0 * * * *', async () => {
      logger.info('Hourly check for critically expiring items...');
      await this.checkCriticalItems();
    });

    logger.info('✅ Notification cron jobs initialized');
  }

  /**
   * Check expiring items and send notifications
   */
  async checkExpiringItems() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get items expiring in next 3 days
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const expiringItems = await Grocery.find({
        expirationDate: {
          $gte: today,
          $lte: threeDaysFromNow
        }
      }).populate('userId');

      // Group by user
      const itemsByUser = this.groupByUser(expiringItems);

      // Send emails
      let emailsSent = 0;
      for (const [userId, items] of Object.entries(itemsByUser)) {
        const user = items[0].userId;
        
        // Check if user has email notifications enabled
        if (user.emailNotifications !== false) {
          const success = await emailService.sendExpirationAlert(user, items);
          if (success) emailsSent++;
        }
      }

      logger.info('Daily expiration check completed', {
        totalItems: expiringItems.length,
        usersNotified: Object.keys(itemsByUser).length,
        emailsSent
      });

      return {
        totalItems: expiringItems.length,
        usersNotified: Object.keys(itemsByUser).length,
        emailsSent
      };
    } catch (error) {
      logger.error('Error in checkExpiringItems', { error: error.message });
      throw error;
    }
  }

  /**
   * Check items expiring in next 24 hours (critical)
   */
  async checkCriticalItems() {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const criticalItems = await Grocery.find({
        expirationDate: {
          $gte: today,
          $lte: tomorrow
        }
      }).populate('userId');

      if (criticalItems.length > 0) {
        logger.warn('Critical items expiring soon', { count: criticalItems.length });
        // Could send push notifications here
      }

      return criticalItems.length;
    } catch (error) {
      logger.error('Error in checkCriticalItems', { error: error.message });
      throw error;
    }
  }

  /**
   * Send immediate notification for a specific item
   * @param {string} userId - User ID
   * @param {Object} item - Grocery item
   */
  async sendImmediateNotification(userId, item) {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      const success = await emailService.sendExpirationAlert(user, [item]);
      logger.info('Immediate notification sent', { userId, itemId: item._id });
      return success;
    } catch (error) {
      logger.error('Error sending immediate notification', { error: error.message });
      return false;
    }
  }

  /**
   * Group items by user
   * @param {Array} items - Array of grocery items
   * @returns {Object} - Items grouped by user ID
   */
  groupByUser(items) {
    const grouped = {};
    items.forEach(item => {
      const userId = item.userId._id.toString();
      if (!grouped[userId]) {
        grouped[userId] = [];
      }
      grouped[userId].push(item);
    });
    return grouped;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const expiringCount = await Grocery.countDocuments({
        expirationDate: {
          $gte: today,
          $lte: threeDaysFromNow
        }
      });

      const expiredCount = await Grocery.countDocuments({
        expirationDate: { $lt: today }
      });

      return {
        expiringInNext3Days: expiringCount,
        expired: expiredCount,
        lastCheckTime: new Date()
      };
    } catch (error) {
      logger.error('Error getting notification stats', { error: error.message });
      throw error;
    }
  }
}

export default new NotificationService();