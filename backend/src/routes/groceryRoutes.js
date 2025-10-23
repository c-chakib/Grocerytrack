import express from 'express';
import {
  createGrocery,
  getAllGroceries,
  getGrocery,
  updateGrocery,
  deleteGrocery
} from '../controllers/groceryController.js';
import authMiddleware from '../middleware/auth.js';
import { validateGroceryCreate } from '../middleware/validateRequest.js'; // <-- Import validation middleware

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/groceries (add validation)
router.post('/', validateGroceryCreate, createGrocery);

// GET /api/groceries
router.get('/', getAllGroceries);

// GET /api/groceries/:id
router.get('/:id', getGrocery);

// PUT /api/groceries/:id (add validation for updates)
router.put('/:id', validateGroceryCreate, updateGrocery);

// DELETE /api/groceries/:id
router.delete('/:id', deleteGrocery);

export default router;