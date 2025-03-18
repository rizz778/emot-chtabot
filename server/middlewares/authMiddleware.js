import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    // 1. Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if the decoded payload contains the user ID
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
    }

    // 4. Find the user in the database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // 5. Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error.stack);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    res.status(401).json({ message: "Unauthorized: Authentication failed", error: error.message });
  }
};

export default protect;

