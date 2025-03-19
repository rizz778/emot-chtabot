import Chat from '../models/Chat.js'
import User from '../models/User.js'
import { encryptMessage,decryptMessage } from '../config/encrypt.js';
export const createSession = async (req,res)=>{
    
    
    
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }
      const { sessionName } = req.body;
      if (!sessionName) {
        return res.status(400).json({ message: "Session name is required" });
      }
        const newSession=await Chat.create({
            user:req.user._id,
            sessionName,
            message:[],
        });
        await newSession.save();
        
        res.status(201).json({
          session: newSession,
          tokens: res.locals.tokens, // Send updated token balance
        });
        console.log("New session created:", newSession);
    } catch (error) {
        console.error("Error creating session:",error);
        res.status(500).json({message:"Server Error" });
    }
}



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

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ message: "Invalid session ID" });
  }

  try {
    const session = await Chat.findOne({ _id: sessionId, user: req.user._id });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const decryptedSession = {
      _id: session._id,
      sessionName: session.sessionName,
      createdAt: session.createdAt,
      messages: session.messages.map(msg => ({
        _id: msg._id,
        sender: msg.sender,
        text: (msg.iv && msg.authTag) ? decryptMessage(msg.text, msg.iv, msg.authTag) : msg.text,
        timestamp: msg.timestamp
      }))
    };

    res.status(200).json(decryptedSession);
  } catch (error) {
    console.error("Error retrieving session messages:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const addMessage = async (req, res) => {
  const { sessionId } = req.params;
  const { sender, text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ message: "Invalid session ID" });
  }

  if (!sender || !text) {
    return res.status(400).json({ message: "Sender and text are required" });
  }

  try {
    const session = await Chat.findOne({ _id: sessionId, user: req.user._id });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const { encrypted, iv, authTag } = encryptMessage(text);
    session.messages.push({ sender, text: encrypted, iv, authTag });
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

