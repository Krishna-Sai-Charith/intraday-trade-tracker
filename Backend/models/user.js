// models/User.js
import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const tradeSchema = new Schema({
  stock: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  tradeType: { 
    type: String, 
    enum: ['BUY', 'SELL'], 
    required: false
  },
  notes: { type: String },
  profitLoss: { type: Number, required: false },
  date: { type: Date, default: Date.now }
});

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: { type: String, required: true },
  trades: [tradeSchema],
  capital: { type: Number, default: 0 },
  favouriteStocks: [{ type: String }]
}, {
  timestamps: true
});

// ✅ Safely export the model
const User = models.User || model('User', userSchema);

export default User;