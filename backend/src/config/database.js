// Database Configuration - MongoDB Connection
import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI not defined in .env file');
    }

    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('   Check your .env file and MongoDB Atlas setup');
    process.exit(1);
  }
};