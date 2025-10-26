import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes.js';
import groceryRoutes from './src/routes/groceryRoutes.js';
import { ApiError } from './src/utils/apiError.js'; // Import your standardized error class
import { errorHandler } from './src/middleware/errorHandler.js'; // Import your error middleware
import { logger } from './src/utils/logger.js';
import { createServer } from 'http'; 
import { initializeSocket } from './src/config/socket.js'
import productRoutes from './src/routes/productRoutes.js';


// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);
app.locals.io = io; 
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
// ===== REQUEST LOGGING =====
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.userId || 'anonymous'
    });
  });
  next();
});
// ===== API ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/groceries', groceryRoutes);
app.use('/api/products', productRoutes);

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
httpServer.listen(PORT, () => {
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