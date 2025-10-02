// backend/routes/tradeRoutes.js
import express from 'express';
import { createTrade, deleteTrade } from '../controllers/tradeController.js'; // ✅ both must be imported
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createTrade);
router.delete('/:id', verifyToken, deleteTrade); // ✅ now deleteTrade is defined

export default router;