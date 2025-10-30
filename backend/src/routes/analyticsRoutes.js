// Analytics Routes - Complete Implementation
import express from 'express';
import Grocery from '../models/Grocery.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * GET DASHBOARD STATISTICS
 * GET /api/analytics/dashboard
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total items tracked
    const totalItems = await Grocery.countDocuments({ userId });

    // Active items (not expired)
    const activeItems = await Grocery.countDocuments({
      userId,
      expirationDate: { $gte: today }
    });

    // Expired items
    const expiredItems = await Grocery.countDocuments({
      userId,
      expirationDate: { $lt: today }
    });

    // Expiring soon (next 3 days)
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const expiringSoon = await Grocery.countDocuments({
      userId,
      expirationDate: {
        $gte: today,
        $lte: threeDaysFromNow
      }
    });

    // Fresh items (more than 3 days)
    const freshItems = await Grocery.countDocuments({
      userId,
      expirationDate: { $gt: threeDaysFromNow }
    });

    // Category breakdown
    const categoryStats = await Grocery.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Location breakdown
    const locationStats = await Grocery.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Grocery.aggregate([
      {
        $match: {
          userId: req.userId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Waste reduction rate
    const wasteReductionRate = totalItems > 0
      ? Math.round(((activeItems + freshItems) / totalItems) * 100)
      : 0;

    // Estimated money saved (assuming $3 per saved item)
    const moneySaved = (activeItems + freshItems) * 3;

    res.json(new ApiResponse(200, {
      overview: {
        totalItems,
        activeItems,
        expiredItems,
        expiringSoon,
        freshItems,
        wasteReductionRate,
        moneySaved
      },
      categoryStats,
      locationStats,
      monthlyTrend
    }, 'Analytics data retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

/**
 * GET WASTE STATISTICS
 * GET /api/analytics/waste
 */
router.get('/waste', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { timeframe = '30' } = req.query; // days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    // Get expired items in timeframe
    const wastedItems = await Grocery.find({
      userId,
      expirationDate: {
        $gte: daysAgo,
        $lt: new Date()
      }
    }).sort({ expirationDate: -1 });

    // Group by category
    const wasteByCategory = await Grocery.aggregate([
      {
        $match: {
          userId,
          expirationDate: {
            $gte: daysAgo,
            $lt: new Date()
          }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          items: { $push: '$name' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Calculate waste metrics
    const totalWasted = wastedItems.length;
    const estimatedCost = totalWasted * 3; // $3 per item
    const co2Emissions = totalWasted * 2.5; // 2.5kg CO2 per item

    res.json(new ApiResponse(200, {
      totalWasted,
      estimatedCost,
      co2Emissions,
      wastedItems: wastedItems.slice(0, 10), // Latest 10
      wasteByCategory,
      timeframe: parseInt(timeframe)
    }, 'Waste statistics retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

/**
 * GET SAVINGS REPORT
 * GET /api/analytics/savings
 */
router.get('/savings', async (req, res, next) => {
  try {
    const userId = req.userId;
    
    // Get all items
    const allItems = await Grocery.countDocuments({ userId });
    
    // Get saved items (consumed before expiration)
    const today = new Date();
    const savedItems = await Grocery.countDocuments({
      userId,
      expirationDate: { $gte: today }
    });

    // Get expired items
    const expiredItems = await Grocery.countDocuments({
      userId,
      expirationDate: { $lt: today }
    });

    // Calculate savings
    const savingsRate = allItems > 0 
      ? Math.round((savedItems / allItems) * 100)
      : 0;
    
    const moneySaved = savedItems * 3;
    const moneyWasted = expiredItems * 3;
    
    // Environmental impact
    const co2Saved = savedItems * 2.5; // kg
    const waterSaved = savedItems * 30; // liters

    // Monthly savings trend
    const monthlySavings = await Grocery.aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            expired: {
              $cond: [{ $lt: ['$expirationDate', today] }, 1, 0]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json(new ApiResponse(200, {
      overview: {
        totalItems: allItems,
        savedItems,
        expiredItems,
        savingsRate
      },
      financial: {
        moneySaved,
        moneyWasted,
        totalSavings: moneySaved - moneyWasted
      },
      environmental: {
        co2Saved,
        waterSaved,
        wasteReduced: savedItems
      },
      monthlySavings
    }, 'Savings report generated successfully'));

  } catch (error) {
    next(error);
  }
});

/**
 * GET CATEGORY INSIGHTS
 * GET /api/analytics/category-insights
 */
router.get('/category-insights', async (req, res, next) => {
  try {
    const userId = req.userId;
    const today = new Date();

    // Get insights per category
    const insights = await Grocery.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $gte: ['$expirationDate', today] }, 1, 0]
            }
          },
          expired: {
            $sum: {
              $cond: [{ $lt: ['$expirationDate', today] }, 1, 0]
            }
          },
          avgQuantity: { $avg: '$quantity' }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          active: 1,
          expired: 1,
          avgQuantity: { $round: ['$avgQuantity', 1] },
          wasteRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$expired', '$total'] },
                  100
                ]
              },
              1
            ]
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(new ApiResponse(200, insights, 'Category insights retrieved'));

  } catch (error) {
    next(error);
  }
});

/**
 * GET USER ACHIEVEMENTS
 * GET /api/analytics/achievements
 */
router.get('/achievements', async (req, res, next) => {
  try {
    const userId = req.userId;
    const today = new Date();

    const totalItems = await Grocery.countDocuments({ userId });
    const savedItems = await Grocery.countDocuments({
      userId,
      expirationDate: { $gte: today }
    });

    const achievements = [];

    // Track milestones
    if (totalItems >= 10) achievements.push({
      id: 'first_10',
      name: 'Getting Started',
      description: 'Tracked 10 items',
      icon: '🎯',
      unlocked: true
    });

    if (totalItems >= 50) achievements.push({
      id: 'half_century',
      name: 'Half Century',
      description: 'Tracked 50 items',
      icon: '🏆',
      unlocked: true
    });

    if (totalItems >= 100) achievements.push({
      id: 'century',
      name: 'Century Club',
      description: 'Tracked 100 items',
      icon: '💯',
      unlocked: true
    });

    if (savedItems >= 20) achievements.push({
      id: 'saver',
      name: 'Food Saver',
      description: 'Saved 20 items from waste',
      icon: '♻️',
      unlocked: true
    });

    if (savedItems >= 50) achievements.push({
      id: 'eco_warrior',
      name: 'Eco Warrior',
      description: 'Saved 50 items from waste',
      icon: '🌱',
      unlocked: true
    });

    // Calculate savings rate
    const savingsRate = totalItems > 0 
      ? Math.round((savedItems / totalItems) * 100)
      : 0;

    if (savingsRate >= 80) achievements.push({
      id: 'efficiency_master',
      name: 'Efficiency Master',
      description: '80%+ waste reduction rate',
      icon: '⭐',
      unlocked: true
    });

    res.json(new ApiResponse(200, {
      achievements,
      stats: {
        totalItems,
        savedItems,
        savingsRate
      }
    }, 'Achievements retrieved'));

  } catch (error) {
    next(error);
  }
});

export default router;