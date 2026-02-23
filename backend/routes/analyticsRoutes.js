import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// analytics only for admin
router.get('/', protect, authorize('admin'), getAnalytics);

export default router;