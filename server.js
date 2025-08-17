import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ CORS setup
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

const corsOptions = {
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Routes
import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);

import quizRoutes from "./routes/quizRoutes.js";
app.use("/api/quiz", quizRoutes);

import geminiRoutes from "./routes/geminiRoutes.js";
app.use("/api/gemini", geminiRoutes);

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Backend working with CORS and MongoDB" });
});

// ✅ Always listen (Render needs this)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;
