import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './routes/authRouter.js';
import chatRouter from './routes/chatRouter.js';
import passport from 'passport';
import './config/passport.js';

// Load environment variables
dotenv.config();

// Initialize server
const app = express();

// Connect MongoDB
connectDB();

// CORS Middleware (Allow all origins)
app.use(cors());

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport Middleware
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRouter);

// Error Handler Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on PORT ${PORT}`);
  });
});
