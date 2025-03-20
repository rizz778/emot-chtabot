import mongoose from "mongoose";

// Define message schema with improved validation and methods
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
  // Encryption metadata fields with validation
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
  }
}, { 
  _id: true // Explicitly enable _id for messages
});

// Define chat session schema with indexes and metadata
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
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: { createdAt: false, updatedAt: 'lastUpdated' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for improved query performance
chatSchema.index({ user: 1, createdAt: -1 }); // Compound index for user's sessions by date

// Method to decrypt message text
messageSchema.methods.getDecryptedText = function(decryptFn) {
  try {
    return decryptFn(this.text, this.iv, this.authTag);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt message");
  }
};

// Virtual for most recent message
chatSchema.virtual('lastMessage').get(function() {
  if (this.messages && this.messages.length > 0) {
    return this.messages[this.messages.length - 1];
  }
  return null;
});

// Pre-save hook to update messageCount
chatSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.messageCount = this.messages.length;
    this.lastUpdated = new Date();
  }
  next();
});

// Static method to find recent chats for a user
chatSchema.statics.findRecentByUser = function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ lastUpdated: -1 })
    .limit(limit)
    .select('sessionName lastUpdated messageCount');
};

// Compile the model
const Chat = mongoose.model('Chat', chatSchema);

export default Chat;