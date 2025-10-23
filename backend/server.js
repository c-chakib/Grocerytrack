import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes.js';
import groceryRoutes from './src/routes/groceryRoutes.js';
import { ApiError } from './src/utils/apiError.js'; // Import your standardized error class
import { errorHandler } from './src/middleware/errorHandler.js'; // Import your error middleware

// Load environment variables
dotenv.config();

const app = express();

// ===== CORS CONFIGURATION =====

app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:3000',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
}));

// ===== BODY PARSER =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== DATABASE CONNECTION =====
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: grocerytrack`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};
connectDB();

// ===== API ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/groceries', groceryRoutes);

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GroceryTrack API is running! ✅',
    cors: 'Enabled for localhost:4200',
    timestamp: new Date().toISOString()
  });
});

// ===== 404 HANDLER (standardized) =====
app.use((req, res, next) => {
  // Pass to global error handler for a unified format
  next(new ApiError(404, 'Route not found', [], '', req.path, req.method));
});

// ===== GLOBAL ERROR HANDLER (standardized) =====
// This must be the LAST middleware
app.use(errorHandler);

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🥬 GroceryTrack Backend Started      ║
║   📍 http://localhost:${PORT}             ║
║   🔐 JWT Authentication: ACTIVE        ║
║   🌐 CORS: Enabled for localhost:4200  ║
║   📊 Database: MongoDB (Connected)     ║
╚════════════════════════════════════════╝
  `);
});

export default app;