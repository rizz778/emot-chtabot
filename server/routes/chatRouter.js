import express  from "express";
import {
  createSession,
  getSessions,
  getSessionMessages,
  addMessage,
} from "../controllers/chatController";
import protect from "../middleware/authMiddleware";

const router = express.Router();

// Routes
router.post("/session", protect, createSession); // Create a new session
router.get("/sessions", protect, getSessions); // Get all sessions
router.get("/session/:sessionId", protect, getSessionMessages); // Get messages for a session
router.post("/session/:sessionId/message", protect, addMessage); // Add message to session

module.exports = router;
