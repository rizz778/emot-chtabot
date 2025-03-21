import express from 'express';
import errorHandler from '../middlewares/errorHandler.js';
import protect from '../middlewares/authMiddleware.js';
import {
    handleGoogleToken,
  getUserDetails,
  Signup,
  Login,
  googleAuth,
  googleAuthCallback,
  logout
} from '../controllers/authController.js';

const router = express.Router();

// Authentication Routes
router.post('/signup', Signup);
router.post('/login', Login);
router.get('/details', protect, getUserDetails);


router.post('/google/callback', handleGoogleToken); // Handle token from frontend
router.get('/logout', logout);

// Global Error Handler
router.use(errorHandler);

export default router;

