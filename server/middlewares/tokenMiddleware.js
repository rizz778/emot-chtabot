import User from "../models/User.js";

export const checkTokens = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.tokens < 2) {
      return res.status(403).json({ message: "Insufficient tokens" });
    }

    user.tokens -= 2;
    await user.save();
    res.locals.tokens = user.tokens;
    next();
  } catch (error) {
    console.error("Token Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
