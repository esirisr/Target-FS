import express from 'express';
import {
  getAdminDashboardData,
  verifyPro,
  toggleSuspension,
  deleteUser
} from '../controllers/adminController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getAdminDashboardData);


router.patch('/verify/:id', protect, authorize('admin'), verifyPro);
router.patch('/suspend/:id', protect, authorize('admin'), toggleSuspension);
router.delete('/user/:id', protect, authorize('admin'), deleteUser);

export default router;