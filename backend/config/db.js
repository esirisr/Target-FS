import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly point to the .env file in your project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is undefined. Check your .env file and path.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;