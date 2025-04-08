import mongoose from "mongoose";

// Define message schema with emotion and distress score
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["user", "bot"],
    required: [true, "Message sender is required"]
  },
  // Encrypted content field
  text: {
    type: String,
    required: [true, "Encrypted message text is required"]
  },
  // Encryption metadata fields
  iv: {
    type: String,
    required: [true, "Initialization vector is required"],
    validate: {
      validator: function(v) {
        // IV should be 32 characters in hex (16 bytes)
        return /^[0-9a-f]{32}$/i.test(v);
      },
      message: "IV must be a valid hex string of correct length"
    }
  },
  authTag: {
    type: String,
    required: [true, "Authentication tag is required"],
    validate: {
      validator: function(v) {
        // Auth tag should be 32 characters in hex (16 bytes)
        return /^[0-9a-f]{32}$/i.test(v);
      },
      message: "Authentication tag must be a valid hex string of correct length"
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Index for sorting and querying by time
  },
  // New fields for emotion tracking
  emotion: {
    type: String,
    enum: ["happy", "sad", "angry", "fear", "surprise", "disgust", "neutral", "unknown"],
    default: "unknown"
  },
  distressScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  }
}, {
  _id: true // Explicitly enable _id for messages
});

// Define chat session schema
const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    index: true // Index for fast user lookups
  },
  sessionName: {
    type: String,
    required: [true, "Session name is required"],
    trim: true,
    maxlength: [100, "Session name cannot exceed 100 characters"]
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Index for sorting and querying
  }
}, {
  timestamps: true
});

// Indexes for improved query performance
chatSchema.index({ user: 1, createdAt: -1 }); // Compound index for user's sessions by date

// Virtual for most recent message
chatSchema.virtual('lastMessage').get(function() {
  if (this.messages && this.messages.length > 0) {
    return this.messages[this.messages.length - 1];
  }
  return null;
});

// Compile the model
const Chat = mongoose.model('Chat', chatSchema);

export default Chat;