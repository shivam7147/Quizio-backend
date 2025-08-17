import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
      
  // Only use Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

    
  if (!token) {
        return res.status(401).json({ message: "Access denied. No token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // adds user id and other info to req
    next();
  } catch (err) {
        return res.status(401).json({ message: "Invalid token." });
  }
};