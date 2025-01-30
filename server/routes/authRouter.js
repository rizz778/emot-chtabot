import express from 'express'
import errorHandler from '../middlewares/errorHandler.js';
import { Signup } from '../controllers/authController.js';
import { Login } from '../controllers/authController.js';
const router = express.Router();

// Routes
router.post("/signup", Signup);
router.post("/login", Login);
router.use(errorHandler);

export default router;
