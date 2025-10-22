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
// backend/controllers/tradeController.js
export const deleteTrade = async (req, res) => {
  try {
    const { id } = req.params;
    // 🔥 FIX: Use req.user.userId, not req.user.id
    const userId = req.user.userId; // ✅ Correct field from JWT

    if (!userId) {
      return res.status(400).json({ message: 'User ID missing in token' });
    }

    const user = await User.findById(userId); // ✅ Now this works
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Deleting trade with ID:', id);

    const tradeExists = user.trades.some(trade => trade._id.toString() === id);
    if (!tradeExists) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    user.trades = user.trades.filter(trade => trade._id.toString() !== id);
    await user.save();
    res.json({ message: 'Trade deleted successfully' });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCalendarStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { year } = req.query;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Filter trades by year - FIXED: use trade.date instead of trade.createdAt
    const yearTrades = user.trades.filter(trade => {
      const tradeDate = new Date(trade.date); // ✅ CHANGED
      return tradeDate.getFullYear() === targetYear;
    });

    // Helper: Calculate stats for a group of trades
    const calculateStats = (trades) => {
      if (trades.length === 0) {
        return { pnl: 0, count: 0, wins: 0, losses: 0, winRate: 0 };
      }
      
      const pnl = trades.reduce((sum, t) => sum + t.profitLoss, 0);
      const wins = trades.filter(t => t.profitLoss > 0).length;
      const losses = trades.filter(t => t.profitLoss < 0).length;
      const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) : 0;
      
      return { pnl, count: trades.length, wins, losses, winRate: parseFloat(winRate) };
    };

    // DAILY STATS (for heatmap)
    const dailyStatsMap = new Map();
    
    yearTrades.forEach(trade => {
      const dateKey = new Date(trade.date).toISOString().split('T')[0]; // ✅ CHANGED
      
      if (!dailyStatsMap.has(dateKey)) {
        dailyStatsMap.set(dateKey, []);
      }
      dailyStatsMap.get(dateKey).push(trade);
    });

    const dailyStats = Array.from(dailyStatsMap.entries()).map(([date, trades]) => ({
      date,
      ...calculateStats(trades)
    }));

    // WEEKLY STATS (current week) - Mon to Fri only
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // ✅ NEW: Start from Monday
    startOfWeek.setDate(now.getDate() + daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyStats = [];
    const tradingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; // ✅ NEW: Only 5 days
    
    for (let i = 0; i < 5; i++) { // ✅ CHANGED: 7 to 5
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dateKey = day.toISOString().split('T')[0];
      
      const dayTrades = yearTrades.filter(trade => {
        const tradeDate = new Date(trade.date).toISOString().split('T')[0]; // ✅ CHANGED
        return tradeDate === dateKey;
      });

      weeklyStats.push({
        date: dateKey,
        dayName: tradingDays[i], // ✅ CHANGED
        ...calculateStats(dayTrades)
      });
    }

    // MONTHLY STATS (current month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();

    const monthlyStats = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayTrades = yearTrades.filter(trade => {
        const tradeDate = new Date(trade.date).toISOString().split('T')[0]; // ✅ CHANGED
        return tradeDate === dateKey;
      });

      monthlyStats.push({
        date: dateKey,
        day,
        ...calculateStats(dayTrades)
      });
    }

    // YEARLY STATS (all 12 months)
    const yearlyStats = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let month = 0; month < 12; month++) {
      const monthTrades = yearTrades.filter(trade => {
        const tradeDate = new Date(trade.date); // ✅ CHANGED
        return tradeDate.getMonth() === month;
      });

      yearlyStats.push({
        month: month + 1,
        monthName: monthNames[month],
        ...calculateStats(monthTrades)
      });
    }

    // OVERALL YEAR SUMMARY
    const yearSummary = calculateStats(yearTrades);

    res.json({
      year: targetYear,
      summary: yearSummary,
      dailyStats,
      weeklyStats,
      monthlyStats,
      yearlyStats
    });

  } catch (error) {
    console.error('Calendar stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};