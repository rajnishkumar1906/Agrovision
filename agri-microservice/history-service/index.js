import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Log from './models/Log.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/agro-history';

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✓ MongoDB connected (History Service)'))
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'History Service Running' });
});

// POST /log - create a new log entry
app.post('/log', async (req, res) => {
  try {
    const { userId, action, details } = req.body;

    if (!userId || !action) {
      return res.status(400).json({
        success: false,
        message: 'userId and action are required',
      });
    }

    const log = await Log.create({ userId, action, details: details || {} });

    return res.status(201).json({ success: true, log });
  } catch (error) {
    console.error('Error creating log:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create log', error: error.message });
  }
});

// GET /history/:userId - fetch logs for a user (newest first)
app.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100, page = 1, action, search } = req.query;
    
    const query = { userId };
    
    // Add action filter if provided
    if (action && action !== 'ALL') {
      query.action = action;
    }
    
    // Add text search if provided
    if (search) {
      query.$or = [
        { 'details.query': { $regex: search, $options: 'i' } },
        { 'details.result.disease': { $regex: search, $options: 'i' } },
        { 'details.result.disease_translated': { $regex: search, $options: 'i' } },
        { 'details.result.recommended_crop': { $regex: search, $options: 'i' } },
        { 'details.result.answer': { $regex: search, $options: 'i' } }
      ];
    }

    console.log(`Fetching history for userId: ${userId}`, query);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Log.countDocuments(query);

    return res.status(200).json({ 
      success: true, 
      count: logs.length, 
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      logs 
    });
  } catch (error) {
    console.error('Error fetching history:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch history', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`History Service listening on http://localhost:${PORT}`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
  console.log(`${'='.repeat(60)}\n`);
});
