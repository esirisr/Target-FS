import express from 'express';
const router = express.Router();
import { 
  createBooking, 
  updateBookingStatus, 
  getMyBookings,
  rateBooking   // ✅ Corrected import
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

// Existing routes
router.post('/create', protect, createBooking);
router.patch('/update-status', protect, updateBookingStatus);
router.get('/my-bookings', protect, getMyBookings);

// Rating route
router.post('/rate', protect, rateBooking);

export default router;