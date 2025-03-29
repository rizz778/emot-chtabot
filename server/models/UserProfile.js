import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  preferredLanguage: { type: String, default: "English" },

  // Emotional & Mental Health Info
  currentMood: {
    type: String,
    enum: ["Happy", "Neutral", "Sad", "Anxious", "Depressed", "Stressed"],
  },
  stressFrequency: {
    type: String,
    enum: ["Rarely", "Sometimes", "Often", "Always"],
  },
  diagnosedCondition: { type: String, default: "None" },
  triggers: { type: [String], default: [] },

  // Lifestyle & Coping Mechanisms
  sleepHours: { type: Number, default: 7 },
  exerciseFrequency: {
    type: String,
    enum: ["Never", "Rarely", "Occasionally", "Regularly"],
  },
  hasSupportSystem: { type: Boolean, default: false },
  copingMechanisms: { type: [String], default: [] },

  // Chatbot Interaction Preferences
  responsePreference: {
    type: String,
    enum: ["Short & Direct", "Empathetic & Supportive", "Deep & Reflective"],
  },
  wantsAffirmations: { type: Boolean, default: true },
  wantsReminders: { type: Boolean, default: false },
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;
