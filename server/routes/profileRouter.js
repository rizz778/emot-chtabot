import express from "express";
import { saveUserProfile, getUserProfile } from "../controllers/userController.js"
import authMiddleware from "../middlewares/authMiddleware.js"; // Import your authentication middleware

const router = express.Router();


router.post("/", authMiddleware, saveUserProfile);
router.get("/", authMiddleware, getUserProfile);

export default router;
