import express from 'express'
import errorHandler from '../middlewares/errorHandler.js';
import { getUserDetails, Signup } from '../controllers/authController.js';
import { Login } from '../controllers/authController.js';
const router = express.Router();
import protect from '../middlewares/authMiddleware.js';
// Routes
router.post("/signup", Signup);
router.post("/login", Login);
router.get("/details",protect,getUserDetails)
router.use(errorHandler);

export default router;
