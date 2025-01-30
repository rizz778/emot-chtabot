import mongoose from "mongoose"

const messageSchema=new mongoose.Schema({
    sender: { type: String, enum: ["user", "bot"], required: true }, // Who sent the message
    text: { type: String, required: true }, // Message text
    timestamp: { type: Date, default: Date.now }, // Timestamp of the message
})

const chatSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user
    sessionName: { type: String, required: true }, // Session name (e.g., "Session 1")
    messages: [messageSchema], // Array of messages
    createdAt: { type: Date, default: Date.now }, // When the session was created
  });


  const Chat = mongoose.model('Chat', chatSchema);
  export default Chat;
  