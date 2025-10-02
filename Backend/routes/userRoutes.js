// backend/routes/userRoutes.js
import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      email: user.email,
      capital: user.capital,
      trades: user.trades
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { capital } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { capital: parseFloat(capital) },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ capital: user.capital });
  } catch (error) {
    console.error('Update capital error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;