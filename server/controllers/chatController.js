import Chat from '../models/Chat.js'
import User from '../models/User.js'
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
  
    try {
      const session = await Chat.findOne({ _id: sessionId, user: req.user._id });
  
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
  
      res.status(200).json(session);
    } catch (error) {
      console.error("Error retrieving session messages:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };

  // Add a message to a session
  export const addMessage = async (req, res) => {
    const { sessionId } = req.params;
    const { sender, text } = req.body;
  
    try {
      const session = await Chat.findOne({ _id: sessionId, user: req.user._id });
  
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
  
      session.messages.push({ sender, text });
      await session.save();
  
      res.status(200).json(session);
    } catch (error) {
      console.error("Error adding message:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };
  