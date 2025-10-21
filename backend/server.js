// Entry Point - Express Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// ===== ROUTES =====
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GroceryTrack API is running! ✅'
  });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🥬 GroceryTrack Backend Started      ║
║   📍 http://localhost:${PORT}             ║
╚════════════════════════════════════════╝
  `);
});
