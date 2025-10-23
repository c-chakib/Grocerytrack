// Global Error Handler Middleware (Axis 1 Best Practice)
import { ApiError } from '../utils/apiError.js';

export const errorHandler = (err, _req, res, _next) => {
  let error = err;

  // Handle validation errors from Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    error = new ApiError(400, 'Validation Error', errors);
  }

  // Handle Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError(400, 'Invalid ID format');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  // If not already an ApiError, wrap it
  if (!(error instanceof ApiError)) {
    error = new ApiError(
      error.statusCode || 500,
      error.message || 'Internal Server Error'
    );
  }

  // Always return standardized error
  res.status(error.statusCode).json({
    statusCode: error.statusCode,
    success: false,
    errors: error.errors || [],
    message: error.message,
    timestamp: error.timestamp,
    ...(error.path && { path: error.path }),
    ...(error.method && { method: error.method }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};