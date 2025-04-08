import UserProfile from "../models/UserProfile.js";
import { cloudinary } from "../config/cloudinary.js";
import { truncate } from "fs/promises";
import Chat from '../models/Chat.js';
// @desc   Save or update user profile
// @route  POST /api/user-profile
// @access Private (Requires Auth)
export const saveUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from authMiddleware
    const userData = req.body;
    
    let userProfile = await UserProfile.findOne({ userId });
    
    if (userProfile) {
      // Update existing user profile
      userProfile = await UserProfile.findOneAndUpdate({ userId }, userData, { new: true });
      return res.status(200).json({ success: true, userProfile });
    } else {
      // Create new user profile
      userProfile = new UserProfile({ userId, ...userData });
      await userProfile.save();
      return res.status(201).json({ success: true, userProfile });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.errors, // Returns detailed validation error messages
      });
    }
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// @desc   Upload profile picture to Cloudinary
// @route  POST /api/user-profile/upload-picture
// @access Private (Requires Auth)
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }
      // Log debugging information
      console.log("Request received for upload:", { 
        userId: userId,
        file: req.file ? { path: req.file.path, filename: req.file.filename } : 'No file'
      });
    // Check if file exists (multer should have attached it to req.file)
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }
    
    // File has already been uploaded to Cloudinary by multer-storage-cloudinary
    // req.file contains the Cloudinary info we need
    const profilePictureData = {
      url: req.file.path, // Cloudinary URL
      publicId: req.file.filename // Cloudinary public ID
    };
    
    // Update user profile with new picture info
    const userProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { profilePicture: profilePictureData },
      { new: true ,upsert:truncate}
    );
    
    if (!userProfile) {
      // If profile doesn't exist, delete the uploaded image
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Profile picture uploaded successfully",
      profilePicture: userProfile.profilePicture
    });
    
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc   Delete profile picture from Cloudinary
// @route  DELETE /api/user-profile/delete-picture
// @access Private (Requires Auth)
export const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userProfile = await UserProfile.findOne({ userId });
    
    if (!userProfile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    
    // Check if user has a profile picture to delete
    if (userProfile.profilePicture && userProfile.profilePicture.publicId) {
      // Delete image from Cloudinary
      await cloudinary.uploader.destroy(userProfile.profilePicture.publicId);
      
      // Update user profile
      userProfile.profilePicture = { url: null, publicId: null };
      await userProfile.save();
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Profile picture deleted successfully" 
    });
    
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Extracted from authMiddleware
    
    const userProfile = await UserProfile.findOne({ userId });
    
    if (!userProfile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    
    res.status(200).json({ success: true, userProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const getUserEmotionAnalytics = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user._id;
    
    // Find all chat sessions for the user
    const userSessions = await Chat.find({ user: userId });
    
    if (!userSessions || userSessions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No chat sessions found for this user" 
      });
    }

    // Initialize analytics variables
    let totalDistressScore = 0;
    let totalUserMessages = 0;
    const emotionCounts = {
      happy: 0,
      sad: 0,
      angry: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      neutral: 0,
      unknown: 0
    };
    
    // Track distress score trends over time
    const distressTrend = [];
    const emotionTrend = [];
    
    // Process each session
    for (const session of userSessions) {
      // Extract user messages from the session
      const userMessages = session.messages.filter(msg => msg.sender === 'user');
      
      // Process each message
      for (const message of userMessages) {
        totalUserMessages++;
        
        // Get message data
        // Check if message has emotion and distressScore properties
        if (message.emotion) {
          emotionCounts[message.emotion] = (emotionCounts[message.emotion] || 0) + 1;
          
          emotionTrend.push({
            timestamp: message.timestamp,
            emotion: message.emotion,
            sessionId: session._id,
            sessionName: session.sessionName
          });
        }
        
        if (typeof message.distressScore === 'number') {
          totalDistressScore += message.distressScore;
          
          distressTrend.push({
            timestamp: message.timestamp,
            score: message.distressScore,
            sessionId: session._id,
            sessionName: session.sessionName
          });
        }
      }
    }
    
    // Calculate average distress score
    const averageDistressScore = totalUserMessages > 0 
      ? parseFloat((totalDistressScore / totalUserMessages).toFixed(2))
      : 0;
    
    // Calculate emotion percentages
    const emotionPercentages = {};
    Object.keys(emotionCounts).forEach(emotion => {
      emotionPercentages[emotion] = totalUserMessages > 0
        ? parseFloat(((emotionCounts[emotion] / totalUserMessages) * 100).toFixed(1))
        : 0;
    });
    
    // Find the dominant emotion
    const dominantEmotion = Object.keys(emotionCounts).reduce(
      (a, b) => emotionCounts[a] > emotionCounts[b] ? a : b, 
      'unknown'
    );
    
    // Group sessions by distress level
    const sessionsByDistress = {
      high: [], // Average distress score >= 7
      medium: [], // Average distress score 4-6.9
      low: [] // Average distress score < 4
    };
    
    // Calculate per-session analytics
    const sessionAnalytics = userSessions.map(session => {
      const sessionUserMessages = session.messages.filter(msg => msg.sender === 'user');
      const sessionMessageCount = sessionUserMessages.length;
      
      // Calculate session distress score
      let sessionDistressTotal = 0;
      sessionUserMessages.forEach(msg => {
        if (typeof msg.distressScore === 'number') {
          sessionDistressTotal += msg.distressScore;
        }
      });
      
      const sessionAvgDistress = sessionMessageCount > 0 
        ? parseFloat((sessionDistressTotal / sessionMessageCount).toFixed(2))
        : 0;
      
      // Categorize by distress level
      if (sessionAvgDistress >= 7) {
        sessionsByDistress.high.push({
          sessionId: session._id,
          sessionName: session.sessionName,
          avgDistress: sessionAvgDistress,
          createdAt: session.createdAt
        });
      } else if (sessionAvgDistress >= 4) {
        sessionsByDistress.medium.push({
          sessionId: session._id,
          sessionName: session.sessionName,
          avgDistress: sessionAvgDistress,
          createdAt: session.createdAt
        });
      } else {
        sessionsByDistress.low.push({
          sessionId: session._id,
          sessionName: session.sessionName,
          avgDistress: sessionAvgDistress,
          createdAt: session.createdAt
        });
      }
      
      return {
        sessionId: session._id,
        sessionName: session.sessionName,
        messageCount: sessionMessageCount,
        averageDistress: sessionAvgDistress,
        createdAt: session.createdAt
      };
    });
    
    // Get recent distress trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentDistressTrend = distressTrend
      .filter(item => new Date(item.timestamp) >= sevenDaysAgo)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Return final analytics data
    return res.status(200).json({
      success: true,
      data: {
        userId: userId.toString(),
        totalSessions: userSessions.length,
        totalUserMessages,
        averageDistressScore,
        emotionCounts,
        emotionPercentages,
        dominantEmotion,
        recentDistressTrend,
        sessionsByDistress,
        sessionAnalytics,
        distressTrend: distressTrend.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        emotionTrend: emotionTrend.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      }
    });
    
  } catch (error) {
    console.error("Error in getUserEmotionAnalytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve emotion analytics",
      error: error.message
    });
  }
};