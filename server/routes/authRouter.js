import express from 'express'
import errorHandler from '../middlewares/errorHandler';
import { Signup } from '../controllers/authController';
import { Login } from '../controllers/authController';
const router = express.Router();

// Routes
router.post("/signup", Signup);
router.post("/login", Login);
router.use(errorHandler);

export default router;
