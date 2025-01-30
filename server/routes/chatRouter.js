import express  from "express";
import {
  createSession,
  getSessions,
  getSessionMessages,
  addMessage,
} from "../controllers/chatController.js";
import protect from"../middlewares/authMiddleware.js";
import errorHandler from "../middlewares/errorHandler.js";
const router = express.Router();

// Routes
router.post("/session", protect, createSession); // Create a new session
router.get("/sessions", protect, getSessions); // Get all sessions
router.get("/session/:sessionId", protect, getSessionMessages); // Get messages for a session
router.post("/session/:sessionId/message", protect, addMessage); // Add message to session
router.use(errorHandler);

export default router;
