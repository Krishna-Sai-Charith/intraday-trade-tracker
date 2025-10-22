// UPDATE YOUR EXISTING tradeRoutes.js

import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
  createTrade, 
  deleteTrade, 
  getCalendarStats  // ADD THIS IMPORT
} from '../controllers/tradeController.js';

const router = express.Router();

// Existing routes
router.post('/', verifyToken, createTrade);
router.delete('/:id', verifyToken, deleteTrade);

// NEW ROUTE - Calendar stats
router.get('/calendar-stats', verifyToken, getCalendarStats);

export default router;