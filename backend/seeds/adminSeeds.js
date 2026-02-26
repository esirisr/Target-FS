import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js'; 
import connectDB from '../config/db.js';

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root (backend folder)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    // 1. Clean up existing admin to avoid duplicates
    await User.deleteMany({ role: 'admin' });

    // 2. Create the new Admin
    const admin = new User({
      name: 'System Admin',
      email: 'admin@homeman.com',
      password: '123456', // The model's middleware usually hashes this
      role: 'admin',
    });

    await admin.save();
    
    console.log('-----------------------------------');
    console.log('✅ Admin user seeded successfully!');
    console.log('Email: admin@homeman.com');
    console.log('Password: 123456');
    console.log('-----------------------------------');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();