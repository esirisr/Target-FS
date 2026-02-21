import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import proRoutes from './routes/proRoutes.js';

dotenv.config();
connectDB();

const app = express();

// ---------- SECURITY + CORS ----------
app.use(cors({
  origin: [
    https://hfe-production.up.railway.app, // Vite local
    "http://localhost:3000", // CRA local
    process.env.FRONTEND_URL // Railway frontend
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ---------- DEBUG ENV CHECK ----------
console.log("Mongo URI Exists:", !!process.env.MONGO_URI);
console.log("JWT Secret Exists:", !!process.env.JWT_SECRET);

// ---------- ROUTES ----------
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pros', proRoutes);

// ---------- GLOBAL ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ message: "Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
