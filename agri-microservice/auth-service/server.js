import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// 1. Connect to MongoDB (Local Compass URL via .env)
connectDB();

// 2. Middleware
app.use(helmet()); // Security headers
app.use(cors());   // Enable Cross-Origin requests
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// 3. API Routes
app.use('/auth', authRoutes);

// 4. Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AgroVision Auth Service',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 5. 404 Handler (If route doesn't exist)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// 6. Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[Error]: ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// 7. Start Server with Port-In-Use Protection
const PORT = process.env.PORT || 4001;

const server = app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Auth Service is live!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🍃 DB:  Connecting to Local MongoDB...`);
  console.log(`${'='.repeat(60)}\n`);
});

// Catch 'Address already in use' errors specifically
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already occupied by another process.`);
    console.error(`👉 Solutions:`);
    console.error(`   1. Change the PORT in your .env file.`);
    console.error(`   2. Close the other application running on this port.`);
    console.error(`   3. Run 'npx kill-port ${PORT}' in your terminal.`);
    process.exit(1);
  }
});