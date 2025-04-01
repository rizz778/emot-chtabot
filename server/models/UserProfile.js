import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  profilePicture: { 
    url: { type: String, required: false },
    publicId: { type: String, required: false } // For cloud storage like Cloudinary
  },
  gender: { type: String, required: false },
  preferredLanguage: { type: String, required: false },
  currentMood: { type: String, required: false },
  stressFrequency: { type: String, required: false },
  diagnosedCondition: { type: String, required: false },
  triggers: { type: [String], required: false },
  sleepHours: { type: Number, required: false },
  exerciseFrequency: { type: String, required: false },
  hasSupportSystem: { type: Boolean, required: false },
  copingMechanisms: { type: [String], required: false },
  responsePreference: { type: String, required: false },
  wantsAffirmations: { type: Boolean, required: false },
  wantsReminders: { type: Boolean, required: false }
}, {
  timestamps: true // Adding timestamps for created and updated times
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;
