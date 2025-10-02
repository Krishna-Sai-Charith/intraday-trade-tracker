import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js'; 
import tradeRoutes from './routes/tradeRoutes.js';
import { verifyToken } from './middleware/auth.js';
import userRoutes from './routes/userRoutes.js';




dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Mount auth routes
app.use('/auth', authRoutes); 

app.use('/trades', verifyToken, tradeRoutes); 

app.use('/api/user', userRoutes);

app.use('/api/trades', tradeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Auth system ready ✅' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});