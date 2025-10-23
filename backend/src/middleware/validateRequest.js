import { ApiError } from '../utils/apiError.js';

const CATEGORIES = ['Dairy', 'Vegetables', 'Fruits', 'Meat', 'Pantry', 'Frozen', 'Other'];
const UNITS = ['L', 'ml', 'kg', 'g', 'pieces', 'packs'];
const LOCATIONS = ['Fridge', 'Freezer', 'Pantry', 'Counter'];

// Grocery create/update input validation
export const validateGroceryCreate = (req, res, next) => {
  const { name, expirationDate, category, quantity, unit, location } = req.body;
  const errors = [];
  if (!name || typeof name !== 'string' || !name.trim())
    errors.push('Name is required and must be a non-empty string.');
  if (!expirationDate || isNaN(new Date(expirationDate).getTime()))
    errors.push('Expiration date is required and must be a valid date.');
  if (category && !CATEGORIES.includes(category))
    errors.push(`Category must be one of: ${CATEGORIES.join(', ')}`);
  if (quantity && (typeof quantity !== 'number' || quantity <= 0))
    errors.push('Quantity must be a positive number.');
  if (unit && !UNITS.includes(unit))
    errors.push(`Unit must be one of: ${UNITS.join(', ')}`);
  if (location && !LOCATIONS.includes(location))
    errors.push(`Location must be one of: ${LOCATIONS.join(', ')}`);
  if (errors.length) throw new ApiError(400, 'Validation Error', errors);
  next();
};

// Auth: Register input validation
export const validateRegister = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = [];
  if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    errors.push('A valid email is required.');
  if (!password || typeof password !== 'string' || password.length < 6)
    errors.push('Password is required and must be at least 6 characters.');
  if (!name || typeof name !== 'string' || !name.trim())
    errors.push('Name is required and must be a non-empty string.');
  if (errors.length) throw new ApiError(400, 'Validation Error', errors);
  next();
};

// Auth: Login input validation
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    errors.push('A valid email is required.');
  if (!password || typeof password !== 'string' || password.length < 6)
    errors.push('Password is required and must be at least 6 characters.');
  if (errors.length) throw new ApiError(400, 'Validation Error', errors);
  next();
};