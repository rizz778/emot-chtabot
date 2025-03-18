import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false }, // Exclude password from queries by default
  googleId: { type: String, unique: true, sparse: true }, // Optional for Google users
  avatar: { type: String }, // Profile picture URL (Google OAuth)
  tokens: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now },
});

// Hash password only if it's new or modified (and exists)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password (handles Google users without passwords)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // Google users won't have a password
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
