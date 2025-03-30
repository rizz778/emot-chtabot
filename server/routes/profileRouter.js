import express from "express";
import { saveUserProfile, getUserProfile } from "../controllers/userController.js"
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/", protect, saveUserProfile);
router.get("/", protect, getUserProfile);

export default router;
