import express from "express";
import {
  createSession,
  getSessions,
  getSessionMessages,
  addMessage,
} from "../controllers/chatController.js";
import protect from "../middlewares/authMiddleware.js";
import errorHandler from "../middlewares/errorHandler.js";
import { checkTokens } from "../middlewares/tokenMiddleware.js";
const router = express.Router();

// Routes
router.post("/sessions", protect,checkTokens, createSession); // Create a new session
router.get("/sessions", protect, getSessions); // Get all sessions
router.get("/sessions/:sessionId", protect, getSessionMessages); // Get messages for a session
router.post("/sessions/:sessionId/messages", protect, addMessage); // Add message to session

// Global error handler (should be last)
router.use(errorHandler);

export default router;
