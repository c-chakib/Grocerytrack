// Authentication Controller - Login & Registration Logic (Best Practice/Axis 1)
// Uses standardized ApiResponse/ApiError, strong error handling

import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import emailService from '../services/emailService.js';


// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// REGISTER: Create new user
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      throw new ApiError(400, 'Please provide email, password, and name');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered. Please login instead.');
    }

    // Create user (password auto-hashed by pre-save middleware)
    const user = new User({ email, password, name });
    await user.save();

    // Send welcome email (don't wait for it)
emailService.sendWelcomeEmail(user).catch(err => 
  console.error('Welcome email failed:', err)
);
    // Generate token
    const token = generateToken(user._id);

    // Return token and user info (standardized)
    res.status(201).json(
      new ApiResponse(201, {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }, "Registration successful")
    );
  } catch (error) {
    next(error);
  }
};

// LOGIN: Authenticate user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password');
    }

    // Find user (include password field for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Compare passwords
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json(
      new ApiResponse(200, {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }, "Login successful")
    );
  } catch (error) {
    next(error);
  }
};

// GET CURRENT USER: Retrieve user profile
export const getCurrentUser = async (req, res, next) => {
  try {
    // req.userId is set by auth middleware
    const user = await User.findById(req.userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, {
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }, "User profile fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};

export default { register, login, getCurrentUser };