// Product Routes - Complete Implementation
import express from 'express';
import { OpenFoodFactsService } from '../services/openFoodFactsService.js';
import { calculateSuggestedExpiration, getCategoryItems, getRecommendedLocation } from '../config/shelfLife.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * SEARCH: Search products by name
 * GET /api/products/search?query=apple&limit=20
 */
router.get('/search', async (req, res, next) => {
  try {
    const { query, limit = 20 } = req.query;

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      throw new ApiError(400, 'Search query must be at least 2 characters');
    }

    // Validate limit
    const limitNum = Math.min(parseInt(limit) || 20, 100);

    // Search products
    const products = await OpenFoodFactsService.searchProducts(query.trim(), limitNum);

    res.json(new ApiResponse(200, products, `Found ${products.length} products`));
  } catch (error) {
    next(error);
  }
});

/**
 * CATEGORY: Get products by category
 * GET /api/products/category/fruits?limit=50
 */
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit = 50 } = req.query;

    // Validate category
    if (!category || typeof category !== 'string') {
      throw new ApiError(400, 'Category is required');
    }

    // Validate limit
    const limitNum = Math.min(parseInt(limit) || 50, 100);

    // Get products
    const products = await OpenFoodFactsService.getProductsByCategory(category, limitNum);

    res.json(new ApiResponse(200, products, `Found ${products.length} products in ${category}`));
  } catch (error) {
    next(error);
  }
});

/**
 * BARCODE: Get product by barcode
 * GET /api/products/barcode/3017620422003
 */
router.get('/barcode/:barcode', async (req, res, next) => {
  try {
    const { barcode } = req.params;

    // Validate barcode
    if (!barcode || typeof barcode !== 'string' || !/^\d+$/.test(barcode)) {
      throw new ApiError(400, 'Invalid barcode format. Must be numeric.');
    }

    // Get product
    const product = await OpenFoodFactsService.getProductByBarcode(barcode);

    if (!product) {
      throw new ApiError(404, 'Product not found for this barcode');
    }

    res.json(new ApiResponse(200, product, 'Product found'));
  } catch (error) {
    next(error);
  }
});

/**
 * SUGGEST EXPIRATION: Calculate suggested expiration date
 * POST /api/products/suggest-expiration
 * Body: { name, category, location }
 */
router.post('/suggest-expiration', async (req, res, next) => {
  try {
    const { name, category, location = 'Fridge' } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ApiError(400, 'Name is required');
    }

    if (!category || typeof category !== 'string') {
      throw new ApiError(400, 'Category is required');
    }

    // Validate location
    const validLocations = ['Fridge', 'Freezer', 'Pantry', 'Counter'];
    if (location && !validLocations.includes(location)) {
      throw new ApiError(400, `Location must be one of: ${validLocations.join(', ')}`);
    }

    // Calculate suggestion
    const suggestion = calculateSuggestedExpiration(name.trim(), category, location);

    res.json(new ApiResponse(200, suggestion, 'Expiration date calculated successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * GET CATEGORY ITEMS: Get all items and their shelf life for a category
 * GET /api/products/category-items/:category
 */
router.get('/category-items/:category', async (req, res, next) => {
  try {
    const { category } = req.params;

    // Validate category
    const validCategories = ['Dairy', 'Vegetables', 'Fruits', 'Meat', 'Frozen', 'Pantry', 'Other'];
    if (!validCategories.includes(category)) {
      throw new ApiError(400, `Category must be one of: ${validCategories.join(', ')}`);
    }

    // Get items
    const items = getCategoryItems(category);

    res.json(new ApiResponse(200, items, `Found ${items.length} items in ${category}`));
  } catch (error) {
    next(error);
  }
});

/**
 * GET RECOMMENDED LOCATION: Get recommended storage location for a category
 * GET /api/products/recommended-location/:category
 */
router.get('/recommended-location/:category', async (req, res, next) => {
  try {
    const { category } = req.params;

    // Validate category
    const validCategories = ['Dairy', 'Vegetables', 'Fruits', 'Meat', 'Frozen', 'Pantry', 'Other'];
    if (!validCategories.includes(category)) {
      throw new ApiError(400, `Category must be one of: ${validCategories.join(', ')}`);
    }

    // Get recommended location
    const location = getRecommendedLocation(category);

    res.json(new ApiResponse(200, { category, recommendedLocation: location }, 'Recommended location retrieved'));
  } catch (error) {
    next(error);
  }
});

export default router;