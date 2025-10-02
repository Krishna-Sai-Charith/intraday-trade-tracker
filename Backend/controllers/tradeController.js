// backend/controllers/tradeController.js
import User from '../models/User.js';

export const createTrade = async (req, res) => {
  try {
    const { stock, entryPrice, exitPrice, quantity, notes, tradeType } = req.body;
    const userId = req.user.userId;

    console.log('📝 Incoming trade data:', { stock, entryPrice, exitPrice, quantity, tradeType, userId });

    // Validate required fields
    if (!stock || entryPrice == null || exitPrice == null || !quantity || !tradeType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate tradeType
    if (tradeType !== 'BUY' && tradeType !== 'SELL') {
      return res.status(400).json({ message: 'tradeType must be "BUY" or "SELL"' });
    }

    // Calculate P&L based on trade type
    let profitLoss;
    if (tradeType === 'BUY') {
      profitLoss = (exitPrice - entryPrice) * quantity;
    } else {
      profitLoss = (entryPrice - exitPrice) * quantity;
    }

    console.log('💰 Calculated profitLoss:', profitLoss);

    // Save trade to user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          trades: {
            stock,
            entryPrice: parseFloat(entryPrice),
            exitPrice: parseFloat(exitPrice),
            quantity: parseInt(quantity),
            tradeType,
            notes: notes || '',
            profitLoss: parseFloat(profitLoss) // ✅ CRITICAL: Include profitLoss!
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newTrade = updatedUser.trades[updatedUser.trades.length - 1];
    console.log('💾 Saved trade to DB:', newTrade);
    
    res.status(201).json({
      message: 'Trade added successfully',
      trade: newTrade
    });

  } catch (error) {
    console.error('❌ Trade creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};