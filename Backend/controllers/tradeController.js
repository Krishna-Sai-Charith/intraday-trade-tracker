import User from '../models/user.js';

export const createTrade = async (req, res) => {
  try {
    const { stock, entryPrice, exitPrice, quantity, notes } = req.body;
    const userId = req.user.userId; // from verifyToken middleware

    // Validate required fields
    if (!stock || entryPrice == null || exitPrice == null || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate P/L
    const profitLoss = (exitPrice - entryPrice) * quantity;

    // Push trade into user's trades array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          trades: {
            stock,
            entryPrice,
            exitPrice,
            quantity,
            notes,
            profitLoss // optional: store calculated value
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(201).json({
      message: 'Trade added successfully',
      trade: updatedUser.trades[updatedUser.trades.length - 1]
    });
  } catch (error) {
    console.error('Trade creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};