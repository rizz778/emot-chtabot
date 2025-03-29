import UserProfile from "../models/userProfile.model.js";

// @desc   Save or update user profile
// @route  POST /api/user-profile
// @access Private (Requires Auth)
export const saveUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Extracted from authMiddleware
    const userData = req.body;

    let userProfile = await UserProfile.findOne({ userId });

    if (userProfile) {
      // Update existing user profile
      userProfile = await UserProfile.findOneAndUpdate({ userId }, userData, {
        new: true,
      });
      return res.status(200).json({ success: true, userProfile });
    } else {
      // Create new user profile
      userProfile = new UserProfile({ userId, ...userData });
      await userProfile.save();
      return res.status(201).json({ success: true, userProfile });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
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
