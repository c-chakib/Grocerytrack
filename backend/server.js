// backend/server.js - CORRECTED IMPORT NAMES
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes.js';        // ✅ FIXED: authRoutes
import groceryRoutes from './src/routes/groceryRoutes.js';  // ✅ FIXED: groceryRoutes

// Load environment variables
dotenv.config();

const app = express();

// ===== CORS CONFIGURATION (MUST be FIRST!) =====
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:3000',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// ===== BODY PARSER MIDDLEWARE =====
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

// ===== HEALTH CHECK ENDPOINT =====
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GroceryTrack API is running! ✅',
    cors: 'Enabled for localhost:4200',
    timestamp: new Date().toISOString()
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

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