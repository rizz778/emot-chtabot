import User  from "../models/User.js";
import  jwt  from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
// Signup Controller
export const Signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

   
    const newUser = new User({ username, email, password});

    await newUser.save();

    // ✅ Create a default chat session
    const chatSession = new Chat({
      user: newUser._id,
      sessionName: "Session 1",
      messages: [],
    });
    await chatSession.save();

    console.log("User saved successfully");

    // ✅ Generate JWT
    const payload = { user: { id: newUser._id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) {
        console.error("JWT Error:", err);
        return res.status(500).json({ message: "Error generating token" });
      }

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
        sessionId: chatSession._id, // ✅ Return session ID
      });
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login Controller


export const Login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Request Body:", req.body);

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    console.log(user.password,password)
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token (Same as in Signup)
    const payload = { user: { id: user._id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, async (err, token) => {
      if (err) {
        console.error("JWT Generation Error:", err);
        return res.status(500).json({ message: "Token generation failed" });
      }

      // Return user data with the token
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



// Fetch User Details
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      tokens: user.tokens, // Include token balance
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

