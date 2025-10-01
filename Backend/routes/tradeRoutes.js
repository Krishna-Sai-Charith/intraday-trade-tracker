import { Router } from 'express';
import { createTrade } from '../controllers/tradeController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// POST /trades → only if logged in
router.post('/', verifyToken, createTrade);

export default router;