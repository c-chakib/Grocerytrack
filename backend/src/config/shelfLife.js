// Shelf Life Configuration - Complete Implementation
// Based on USDA FoodKeeper data and food safety guidelines

export const SHELF_LIFE_DAYS = {
  'Dairy': {
    default: 7,
    items: {
      'milk': 7,
      'yogurt': 14,
      'cheese': 21,
      'cheddar': 30,
      'mozzarella': 21,
      'parmesan': 60,
      'butter': 90,
      'cream': 5,
      'sour cream': 21,
      'cottage cheese': 10
    }
  },
  'Vegetables': {
    default: 5,
    items: {
      'lettuce': 7,
      'salad': 5,
      'carrot': 21,
      'tomato': 7,
      'potato': 30,
      'sweet potato': 21,
      'onion': 30,
      'garlic': 90,
      'cucumber': 7,
      'broccoli': 5,
      'cauliflower': 7,
      'spinach': 5,
      'kale': 7,
      'bell pepper': 7,
      'pepper': 7,
      'celery': 14,
      'mushroom': 5,
      'zucchini': 5,
      'eggplant': 7,
      'cabbage': 14
    }
  },
  'Fruits': {
    default: 5,
    items: {
      'apple': 14,
      'banana': 5,
      'orange': 14,
      'lemon': 21,
      'lime': 21,
      'strawberry': 3,
      'blueberry': 7,
      'raspberry': 3,
      'grapes': 7,
      'grape': 7,
      'melon': 7,
      'watermelon': 7,
      'cantaloupe': 5,
      'avocado': 5,
      'pear': 7,
      'peach': 5,
      'plum': 5,
      'mango': 5,
      'pineapple': 3,
      'kiwi': 7,
      'cherry': 3
    }
  },
  'Meat': {
    default: 3,
    items: {
      'chicken': 2,
      'turkey': 2,
      'beef': 3,
      'steak': 3,
      'ground beef': 1,
      'ground meat': 1,
      'pork': 3,
      'bacon': 7,
      'sausage': 7,
      'ham': 5,
      'fish': 2,
      'salmon': 2,
      'tuna': 2,
      'shrimp': 2,
      'seafood': 2,
      'lamb': 3,
      'deli meat': 5
    }
  },
  'Frozen': {
    default: 90,
    items: {
      'frozen vegetables': 180,
      'frozen fruit': 180,
      'frozen meat': 90,
      'frozen chicken': 270,
      'frozen beef': 270,
      'frozen fish': 180,
      'ice cream': 60,
      'frozen pizza': 180,
      'frozen meals': 90
    }
  },
  'Pantry': {
    default: 365,
    items: {
      'pasta': 730,
      'rice': 730,
      'canned food': 730,
      'canned beans': 730,
      'canned vegetables': 730,
      'canned fruit': 730,
      'flour': 180,
      'sugar': 730,
      'salt': 3650,
      'oil': 180,
      'olive oil': 365,
      'vinegar': 730,
      'honey': 3650,
      'peanut butter': 180,
      'jam': 365,
      'cereal': 365,
      'crackers': 180,
      'cookies': 90,
      'chips': 60,
      'bread': 7,
      'tortilla': 30,
      'spices': 365
    }
  },
  'Other': {
    default: 30
  }
};

/**
 * Calculate suggested expiration date based on item properties
 * @param {string} name - Item name
 * @param {string} category - Item category
 * @param {string} location - Storage location
 * @returns {Object} - Suggestion with date and metadata
 */
export const calculateSuggestedExpiration = (name, category, location) => {
  // Validate inputs
  if (!name || !category) {
    return {
      suggestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      shelfLifeDays: 7,
      isEstimated: true,
      confidence: 'low'
    };
  }

  // Get category data
  const categoryData = SHELF_LIFE_DAYS[category] || SHELF_LIFE_DAYS['Other'];
  let shelfLifeDays = categoryData.default;
  let confidence = 'medium';

  // Check for specific item match
  if (categoryData.items) {
    const nameLower = name.toLowerCase().trim();
    
    // Exact match
    if (categoryData.items[nameLower]) {
      shelfLifeDays = categoryData.items[nameLower];
      confidence = 'high';
    } else {
      // Partial match
      for (const [itemName, days] of Object.entries(categoryData.items)) {
        if (nameLower.includes(itemName) || itemName.includes(nameLower)) {
          shelfLifeDays = days;
          confidence = 'high';
          break;
        }
      }
    }
  }

  // Adjust based on storage location
  let locationMultiplier = 1;
  let locationNote = '';

  switch (location) {
    case 'Freezer':
      locationMultiplier = 3;
      locationNote = 'Extended shelf life in freezer';
      break;
    case 'Fridge':
      locationMultiplier = 1;
      locationNote = 'Standard refrigerated storage';
      break;
    case 'Pantry':
      // Pantry items usually have longer default life
      if (category !== 'Pantry') {
        locationMultiplier = 0.7;
        locationNote = 'Reduced shelf life at room temperature';
      } else {
        locationNote = 'Optimal pantry storage';
      }
      break;
    case 'Counter':
      if (category === 'Fruits' || category === 'Vegetables') {
        locationMultiplier = 0.8;
        locationNote = 'Counter storage for fruits/vegetables';
      } else {
        locationMultiplier = 0.5;
        locationNote = 'Significantly reduced shelf life on counter';
      }
      break;
    default:
      locationNote = 'Standard storage';
  }

  // Calculate final shelf life
  const finalShelfLifeDays = Math.max(1, Math.floor(shelfLifeDays * locationMultiplier));

  // Calculate expiration date
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + finalShelfLifeDays);

  return {
    suggestedDate: expirationDate.toISOString(),
    shelfLifeDays: finalShelfLifeDays,
    originalShelfLife: shelfLifeDays,
    locationMultiplier,
    locationNote,
    confidence,
    isEstimated: true,
    category,
    location
  };
};

/**
 * Get all available items for a category
 * @param {string} category - Category name
 * @returns {Array} - Array of item names with shelf life
 */
export const getCategoryItems = (category) => {
  const categoryData = SHELF_LIFE_DAYS[category];
  if (!categoryData || !categoryData.items) {
    return [];
  }

  return Object.entries(categoryData.items).map(([name, days]) => ({
    name,
    shelfLifeDays: days
  }));
};

/**
 * Get recommended storage location for a category
 * @param {string} category - Category name
 * @returns {string} - Recommended location
 */
export const getRecommendedLocation = (category) => {
  const locationMap = {
    'Dairy': 'Fridge',
    'Meat': 'Fridge',
    'Vegetables': 'Fridge',
    'Fruits': 'Counter',
    'Frozen': 'Freezer',
    'Pantry': 'Pantry',
    'Other': 'Pantry'
  };

  return locationMap[category] || 'Pantry';
};