import UserProfile from "../models/UserProfile.js";
import { cloudinary } from "../config/cloudinary.js";
import { truncate } from "fs/promises";

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
