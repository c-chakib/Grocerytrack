// Grocery Controller - CRUD Operations (Best Practice/Axis 1)
// Uses standardized ApiResponse/ApiError, asyncHandler, backend filtering

import Grocery from '../models/Grocery.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { emitToUser } from '../config/socket.js';


// Helper: Calculate grocery status
const calculateStatus = (expirationDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate);
  expiry.setHours(0, 0, 0, 0);
  const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 3) return 'expiring-soon';
  return 'fresh';
};

// CREATE: Add new grocery
export const createGrocery = async (req, res, next) => {
  try {
    const { name, category, expirationDate, quantity, unit, location, notes } = req.body;

    if (!name || !expirationDate) {
      throw new ApiError(400, 'Please provide name and expiration date');
    }

    const status = calculateStatus(expirationDate);

    const grocery = new Grocery({
      userId: req.userId,
      name,
      category: category || 'Other',
      expirationDate,
      quantity: quantity || 1,
      unit: unit || 'pieces',
      location: location || 'Fridge',
      status,
      notes: notes || ''
    });

    await grocery.save();
        // ADD SOCKET EMIT
        if (req.app.locals.io) {
      emitToUser(req.app.locals.io, req.userId, 'grocery:created', grocery);
    }
    res.status(201).json(new ApiResponse(201, grocery, "Grocery created successfully"));
  } catch (error) {
    next(error);
  }
};

// READ ALL: Get all groceries for user (with backend filtering/sorting/pagination)
export const getAllGroceries = async (req, res, next) => {
  try {
    // Query params for filtering/sorting/pagination
    const {
      category = 'all',
      search = '',
      sort = 'expiration-asc',
      limit = 50,
      offset = 0
    } = req.query;

    let query = { userId: req.userId };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search by name/category
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort
    let sortOptions = {};
    if (sort === 'expiration-asc') sortOptions = { expirationDate: 1 };
    else if (sort === 'expiration-desc') sortOptions = { expirationDate: -1 };
    else sortOptions = { createdAt: -1 };

    // Pagination
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = Math.max(parseInt(offset) || 0, 0);

    // Query MongoDB
    const groceries = await Grocery.find(query)
      .sort(sortOptions)
      .limit(limitNum)
      .skip(offsetNum);

    // Get count for pagination
    const total = await Grocery.countDocuments(query);

    // Recalculate status/daysUntilExpiry
    const result = groceries.map(g => ({
      ...g._doc,
      status: calculateStatus(g.expirationDate),
      daysUntilExpiry: Math.floor(
        (new Date(g.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    }));

    res.json(new ApiResponse(200, {
      groceries: result,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total
      }
    }, "Groceries fetched successfully"));
  } catch (error) {
    next(error);
  }
};

// READ ONE: Get single grocery
export const getGrocery = async (req, res, next) => {
  try {
    const grocery = await Grocery.findById(req.params.id);

    if (!grocery) throw new ApiError(404, "Grocery not found");

    if (grocery.userId.toString() !== req.userId.toString()) {
      throw new ApiError(403, "Not authorized");
    }

    res.json(new ApiResponse(200, grocery, "Grocery fetched successfully"));
  } catch (error) {
    next(error);
  }
};

// UPDATE: Update grocery
export const updateGrocery = async (req, res, next) => {
  try {
    let grocery = await Grocery.findById(req.params.id);

    if (!grocery) throw new ApiError(404, "Grocery not found");

    if (grocery.userId.toString() !== req.userId.toString()) {
      throw new ApiError(403, "Not authorized");
    }

    // Update fields
    grocery = await Grocery.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
            // ADD SOCKET EMIT
        if (req.app.locals.io) {
      emitToUser(req.app.locals.io, req.userId, 'grocery:updated', grocery);
    }
    res.json(new ApiResponse(200, grocery, "Grocery updated successfully"));
  } catch (error) {
    next(error);
  }
};

// DELETE: Remove grocery
export const deleteGrocery = async (req, res, next) => {
  try {
    const grocery = await Grocery.findById(req.params.id);

    if (!grocery) throw new ApiError(404, "Grocery not found");

    if (grocery.userId.toString() !== req.userId.toString()) {
      throw new ApiError(403, "Not authorized");
    }

    await Grocery.findByIdAndDelete(req.params.id);
            // ADD SOCKET EMIT
        if (req.app.locals.io) {
      emitToUser(req.app.locals.io, req.userId, 'grocery:deleted', { id: req.params.id });
    }
    res.json(new ApiResponse(200, null, "Grocery deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export default {
  createGrocery,
  getAllGroceries,
  getGrocery,
  updateGrocery,
  deleteGrocery
};