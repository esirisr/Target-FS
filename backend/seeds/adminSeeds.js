import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("MONGODB_URI missing in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    const exists = await User.findOne({ email: "admin@homeman.com" });
    if (exists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashed = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Super Admin",
      email: "admin@homeman.com",
      password: hashed,
      role: "admin",
      location: "hargeisa",
      skills: []
    });

    console.log("Admin created successfully");
    process.exit(0);

  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

createAdmin();