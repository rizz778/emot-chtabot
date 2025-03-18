import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js";
import passport from "passport";
import { OAuth2Client } from 'google-auth-library';
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Google Signup/Login
export const googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });

export const googleAuthCallback = (req, res) => {
  passport.authenticate("google", { failureRedirect: "/login" }, async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ message: "Authentication Failed" });
    }

    try {
      const token = generateToken(user._id);
      
      // For API requests from frontend
      if (req.get('Accept') === 'application/json') {
        return res.json({ 
          token, 
          user: { 
            id: user._id, 
            username: user.username, 
            email: user.email, 
            avatar: user.avatar 
          } 
        });
      }
      
      
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.status(500).json({ message: "Server Error" });
    }
  })(req, res);
};

export const handleGoogleToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Verify the token with Google
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub } = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ googleId: sub });

    if (!user) {
      user = new User({
        googleId: sub,
        username: name,
        email: email,
        avatar: picture,
      });
      await user.save();

      // Create a default chat session for new users
      const chatSession = new Chat({ user: user._id, sessionName: "Session 1", messages: [] });
      await chatSession.save();
    }

    // Generate JWT
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout Failed" });
    res.status(200).json({ message: "Logout Successful" });
  });
};

// Signup Controller
export const Signup = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    const chatSession = new Chat({ user: newUser._id, sessionName: "Session 1", messages: [] });
    await chatSession.save();

    const token = generateToken(newUser._id);
    
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { 
        id: newUser._id, 
        username: newUser.username, 
        email: newUser.email 
      },
      sessionId: chatSession._id
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login Controller
export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    
    res.status(200).json({
      message: "Login successful",
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        avatar: user.avatar 
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Fetch User Details
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ 
      id: user._id, 
      username: user.username, 
      email: user.email, 
      tokens: user.tokens,
      avatar: user.avatar
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};