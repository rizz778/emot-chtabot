import Chat from '../models/Chat.js'
import mongoose from 'mongoose'
import User from '../models/User.js'
import { encryptMessage,decryptMessage } from '../config/encrypt.js';


export const createSession = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const { sessionName } = req.body;
    if (!sessionName) {
      return res.status(400).json({ message: "Session name is required" });
    }

    // Create new chat session
    const newSession = await Chat.create({
      user: req.user._id,
      sessionName,
      message: [],
    });

    await newSession.save();

    res.status(201).json({
      sessionId: newSession._id,  // Directly send sessionId
      sessionName: newSession.sessionName,
      tokens: res.locals.tokens,  // Updated token balance
    });

    console.log("New session created:", newSession);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Server Error" });
  }
};




//Retreive all sessions for a user
export const getSessions = async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }

      const sessions = await Chat.find({ user: req.user._id }).select("sessionName createdAt");
      res.status(200).json(sessions);
    } catch (error) {
      console.error("Error retrieving sessions:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };

// Retrieve a specific session's messages
export const getSessionMessages = async (req, res) => {
  const { sessionId } = req.params;
  
  // Validate session ID format
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ message: "Invalid session ID format" });
  }
  
  try {
    // Find session with more specific query and lean() for performance
    const session = await Chat.findOne({ 
      _id: sessionId, 
      user: req.user._id 
    }).lean();
    
    // Handle not found case
    if (!session) {
      return res.status(404).json({ message: "Chat session not found or unauthorized" });
    }
    
    // Decrypt messages and transform response
    const decryptedSession = {
      _id: session._id,
      sessionName: session.sessionName,
      createdAt: session.createdAt,
      messages: session.messages.map(msg => ({
        _id: msg._id,
        sender: msg.sender,
        text: msg.iv && msg.authTag ? 
          decryptMessage(msg.text, msg.iv, msg.authTag) : 
          msg.text,
        timestamp: msg.timestamp
      }))
    };
    
    return res.status(200).json(decryptedSession);
  } catch (error) {
    console.error("Error retrieving session messages:", error);
    return res.status(500).json({ 
      message: "Failed to retrieve messages", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const addMessage = async (req, res) => {
  const { sessionId } = req.params;
  const { sender, text,timestamp } = req.body;
  
  // Input validation
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ message: "Invalid session ID format" });
  }
  
  if (!sender || typeof sender !== 'string') {
    return res.status(400).json({ message: "Valid sender is required" });
  }
  
  if (!text || typeof text !== 'string' || text.trim() === "") {
    return res.status(400).json({ message: "Message text cannot be empty" });
  }
  
  try {
    // Find and update in one operation for better performance
    const session = await Chat.findOneAndUpdate(
      { _id: sessionId, user: req.user._id },
      { 
        $push: { 
          messages: {
            sender,
            ...encryptMessage(text.trim()), // Destructure encryption results
            timestamp
          }
        } 
      },
      { new: true, runValidators: true }
    );
    
    if (!session) {
      return res.status(404).json({ message: "Chat session not found or unauthorized" });
    }
    
    // Return minimal response
    return res.status(201).json({ 
      message: "Message added successfully",
      messageId: session.messages[session.messages.length - 1]._id
    });
  } catch (error) {
    console.error("Error adding message:", error);
    return res.status(500).json({ 
      message: "Failed to add message", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};