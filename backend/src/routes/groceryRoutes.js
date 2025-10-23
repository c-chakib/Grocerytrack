// Grocery Routes
import express from 'express';
import {
  createGrocery,
  getAllGroceries,
  getGrocery,
  updateGrocery,
  deleteGrocery
} from '../controllers/groceryController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/groceries
router.post('/', createGrocery);

// GET /api/groceries
router.get('/', getAllGroceries);

// GET /api/groceries/:id
router.get('/:id', getGrocery);

// PUT /api/groceries/:id
router.put('/:id', updateGrocery);

// DELETE /api/groceries/:id
router.delete('/:id', deleteGrocery);

export default router;