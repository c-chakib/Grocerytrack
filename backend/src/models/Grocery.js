// Grocery Model - Defines grocery item structure
import mongoose from 'mongoose';

const grocerySchema = new mongoose.Schema({
  // Reference to user who owns this item
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },

  // Item name
  name: {
    type: String,
    required: [true, 'Grocery name is required'],
    trim: true
  },

  // Category
  category: {
    type: String,
    enum: ['Dairy', 'Vegetables', 'Fruits', 'Meat', 'Pantry', 'Frozen', 'Other'],
    default: 'Other'
  },

  // When purchased
  purchaseDate: {
    type: Date,
    default: Date.now
  },

  // CRITICAL: When it expires
  expirationDate: {
    type: Date,
    required: [true, 'Expiration date is required']
  },

  // How many
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },

  // Unit (L, kg, pieces, etc)
  unit: {
    type: String,
    enum: ['L', 'ml', 'kg', 'g', 'pieces', 'packs'],
    default: 'pieces'
  },

  // Where stored
  location: {
    type: String,
    enum: ['Fridge', 'Freezer', 'Pantry', 'Counter'],
    default: 'Fridge'
  },

  // Status (calculated on read, not stored)
  status: {
    type: String,
    enum: ['fresh', 'expiring-soon', 'expired'],
    default: 'fresh'
  },

  // Optional notes
  notes: {
    type: String,
    default: ''
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Grocery = mongoose.model('Grocery', grocerySchema);
export default Grocery;