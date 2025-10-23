// Grocery Controller - CRUD Operations
import Grocery from '../models/Grocery.js';

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

    // Validate required fields
    if (!name || !expirationDate) {
      return res.status(400).json({
        error: 'Please provide name and expiration date'
      });
    }

    // Calculate status
    const status = calculateStatus(expirationDate);

    // Create grocery
    const grocery = new Grocery({
      userId: req.userId, // From auth middleware
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

    res.status(201).json(grocery);
  } catch (error) {
    next(error);
  }
};

// READ ALL: Get all groceries for user
export const getAllGroceries = async (req, res, next) => {
  try {
    // Find all groceries for this user, sorted by expiration
    const groceries = await Grocery.find({ userId: req.userId })
      .sort({ expirationDate: 1 });

    // Recalculate status for each (in case time has passed)
    const updated = groceries.map(g => ({
      ...g._doc,
      status: calculateStatus(g.expirationDate)
    }));

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// READ ONE: Get single grocery
export const getGrocery = async (req, res, next) => {
  try {
    const grocery = await Grocery.findById(req.params.id);

    if (!grocery) {
      return res.status(404).json({
        error: 'Grocery not found'
      });
    }

    // Verify ownership (security!)
    if (grocery.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    res.json(grocery);
  } catch (error) {
    next(error);
  }
};

// UPDATE: Update grocery
export const updateGrocery = async (req, res, next) => {
  try {
    let grocery = await Grocery.findById(req.params.id);

    if (!grocery) {
      return res.status(404).json({
        error: 'Grocery not found'
      });
    }

    // Verify ownership
    if (grocery.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    // Update fields
    grocery = await Grocery.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.json(grocery);
  } catch (error) {
    next(error);
  }
};

// DELETE: Remove grocery
export const deleteGrocery = async (req, res, next) => {
  try {
    const grocery = await Grocery.findById(req.params.id);

    if (!grocery) {
      return res.status(404).json({
        error: 'Grocery not found'
      });
    }

    // Verify ownership
    if (grocery.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    await Grocery.findByIdAndDelete(req.params.id);

    res.json({ message: 'Grocery deleted successfully' });
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