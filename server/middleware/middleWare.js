const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Headers:", req.headers);
  console.log("Authorization Header:", authHeader);

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      console.log("Extracted Token:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      console.error("JWT error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.log("No valid Authorization header");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;
