import User  from "../models/User.js";
import  jwt  from "jsonwebtoken";
import bcrypt from "bcryptjs";
// Generate a JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
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

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashedPassword });

      await newUser.save();
      console.log("User saved successfully")
      const token = generateToken(newUser._id);
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
  } catch (error) {
      console.error("Signup Error:", error);  // 🚨 This will show the error in your backend terminal
      res.status(500).json({ message: "Server Error" });
  }
};

// Login Controller
export const Login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Request Body:', req.body);
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Return user data and token
    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
