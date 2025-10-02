// backend/routes/authRoutes.js
import { Router } from 'express';
import { register, login, updateProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await (await import('../models/user.js')).default.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      user: {
        id: user._id,
        email: user.email,
        capital: user.capital,
        trades: user.trades
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.patch('/profile', verifyToken, updateProfile);

export default router;