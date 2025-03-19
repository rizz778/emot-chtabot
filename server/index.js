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
import session from 'express-session';

// Load environment variables
dotenv.config();

// Initialize server
const app = express();

// Connect MongoDB
connectDB();

// Enable CORS
app.use(cors());

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for Passport (IMPORTANT: Ensure SESSION_SECRET is set in .env)
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Load from .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      httpOnly: true, // Prevent client-side JS from accessing the cookie
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

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
