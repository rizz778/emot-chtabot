import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    sender: { 
      type: String, 
      enum: ["user", "bot"], 
      required: true 
    },
    // Original text field is now for encrypted content
    text: { 
      type: String, 
      required: true 
    },
    // Encryption metadata fields 
    iv: { 
      type: String, 
      required: true 
    },
    authTag: { 
      type: String, 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  });

const chatSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user
    sessionName: { type: String, required: true }, // Session name (e.g., "Session 1")
    messages: [messageSchema], // Array of messages
    createdAt: { type: Date, default: Date.now }, // When the session was created
  });

 
messageSchema.methods.getDecryptedText = function(decryptFn) {
  return decryptFn(this.text, this.iv, this.authTag);
};


  const Chat = mongoose.model('Chat', chatSchema);
  export default Chat;
  