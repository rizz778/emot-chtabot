import jwt from "jsonwebtoken";
import User from "../models/User.js";

const  protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user; // ✅ Set `req.user`
    next();
  } catch (error) {
    console.error("Auth Error:", error.stack);
    res.status(401).json({ message: "Unauthorized: Invalid token", error: error.message });
  }
};

export default protect;