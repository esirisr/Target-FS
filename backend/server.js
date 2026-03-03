import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import proRoutes from "./routes/proRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();

const app = express();

/* =====================================================
   1️⃣ ALLOWED ORIGINS (NO TRAILING SLASHES)
===================================================== */
const allowedOrigins = [
  "http://localhost:5173",
  "https://hfe-production.up.railway.app",
   "https://target-fe-production.up.railway.app",
   "https://myfe.up.railway.app"
];

/* =====================================================
   2️⃣ GLOBAL CORS CONFIGURATION
===================================================== */
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow tools like Postman or curl (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =====================================================
   3️⃣ BODY PARSER
===================================================== */
app.use(express.json());

/* =====================================================
   4️⃣ DATABASE CONNECTION
===================================================== */
connectDB();

/* =====================================================
   5️⃣ ROUTES
===================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pros", proRoutes);

/* =====================================================
   6️⃣ HEALTH CHECK
===================================================== */
app.get("/", (req, res) => {
  res.status(200).send("API is running...");
});

/* =====================================================
   7️⃣ GLOBAL ERROR HANDLER (IMPORTANT FOR CORS ERRORS)
===================================================== */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

/* =====================================================
   8️⃣ START SERVER
===================================================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
