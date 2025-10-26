// Open Food Facts API Service - Complete Implementation
import axios from 'axios';
import { logger } from '../utils/logger.js';

const BASE_URL = 'https://world.openfoodfacts.org';

export class OpenFoodFactsService {
  /**
   * Search products by name
   * @param {string} query - Search term
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} - Array of products
   */
  static async searchProducts(query, limit = 20) {
    try {
      const response = await axios.get(`${BASE_URL}/cgi/search.pl`, {
        params: {
          search_terms: query,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: limit
        },
        timeout: 5000
      });

      if (!response.data || !response.data.products) {
        return [];
      }

      return response.data.products.map(product => ({
        id: product.id || product._id || product.code,
        name: product.product_name || product.product_name_en || 'Unknown Product',
        category: this.mapCategory(product.categories_tags || []),
        image: product.image_url || product.image_front_url || product.image_small_url || null,
        barcode: product.code || null,
        brands: product.brands || 'Generic'
      })).filter(product => product.name !== 'Unknown Product');

    } catch (error) {
      logger.error('Open Food Facts search error:', {
        message: error.message,
        query,
        stack: error.stack
      });
      return [];
    }
  }

  /**
   * Get products by category
   * @param {string} category - Category name
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} - Array of products
   */
  static async getProductsByCategory(category, limit = 50) {
    try {
      const response = await axios.get(`${BASE_URL}/category/${category}.json`, {
        params: { page_size: limit },
        timeout: 5000
      });

      if (!response.data || !response.data.products) {
        return [];
      }

      return response.data.products.map(product => ({
        id: product.id || product._id || product.code,
        name: product.product_name || 'Unknown Product',
        category: this.mapCategory(product.categories_tags || []),
        image: product.image_url || null,
        barcode: product.code || null
      })).filter(product => product.name !== 'Unknown Product');

    } catch (error) {
      logger.error('Open Food Facts category error:', {
        message: error.message,
        category,
        stack: error.stack
      });
      return [];
    }
  }

  /**
   * Get product by barcode
   * @param {string} barcode - Product barcode
   * @returns {Promise<Object|null>} - Product object or null
   */
  static async getProductByBarcode(barcode) {
    try {
      const response = await axios.get(`${BASE_URL}/api/v0/product/${barcode}.json`, {
        timeout: 5000
      });

      if (!response.data || response.data.status === 0) {
        logger.info('Product not found for barcode:', barcode);
        return null;
      }

      const product = response.data.product;
      return {
        id: product.id || product._id || product.code,
        name: product.product_name || product.product_name_en || 'Unknown Product',
        category: this.mapCategory(product.categories_tags || []),
        image: product.image_url || product.image_front_url || null,
        barcode: product.code,
        brands: product.brands || 'Generic',
        nutritionGrade: product.nutrition_grade_fr || null,
        ingredients: product.ingredients_text || null
      };

    } catch (error) {
      logger.error('Open Food Facts barcode error:', {
        message: error.message,
        barcode,
        stack: error.stack
      });
      return null;
    }
  }

  /**
   * Map Open Food Facts categories to app categories
   * @param {Array} categoriesTags - Array of category tags
   * @returns {string} - Mapped category
   */
  static mapCategory(categoriesTags) {
    if (!Array.isArray(categoriesTags) || categoriesTags.length === 0) {
      return 'Other';
    }

    const categoryMap = {
      'fruits': 'Fruits',
      'fruit': 'Fruits',
      'vegetables': 'Vegetables',
      'vegetable': 'Vegetables',
      'legumes': 'Vegetables',
      'dairies': 'Dairy',
      'dairy': 'Dairy',
      'milk': 'Dairy',
      'cheese': 'Dairy',
      'yogurt': 'Dairy',
      'meats': 'Meat',
      'meat': 'Meat',
      'poultry': 'Meat',
      'fish': 'Meat',
      'seafood': 'Meat',
      'frozen': 'Frozen',
      'ice-cream': 'Frozen',
      'pantry': 'Pantry',
      'canned': 'Pantry',
      'pasta': 'Pantry',
      'rice': 'Pantry',
      'bread': 'Pantry',
      'cereals': 'Pantry'
    };

    // Check each tag for matches
    for (const tag of categoriesTags) {
      const tagLower = tag.toLowerCase();
      for (const [key, value] of Object.entries(categoryMap)) {
        if (tagLower.includes(key)) {
          return value;
        }
      }
    }

    return 'Other';
  }
}