// Backend/models/User.js
import { Schema, model } from 'mongoose';

const tradeSchema = new Schema({
  stock: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  notes: { type: String },
  date: { type: Date, default: Date.now }
});

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] // ✅ Email regex validation
  },
  password: { type: String, required: true },
  trades: [tradeSchema],
  capital: { type: Number, default: 0 },
  favouriteStocks: [{ type: String }]
}, {
  timestamps: true
});

export default model('User', userSchema);