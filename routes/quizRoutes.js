import express from "express";
import { createQuiz, submitQuiz, getResults, getMyQuizzes, getQuizByShareId, getQuizById } from "../controllers/quizController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", isAuthenticated, createQuiz);
router.get("/created-by-me", isAuthenticated, getMyQuizzes);
router.get("/code/:shareId", getQuizByShareId);
router.post("/:id/submit", submitQuiz);
router.get("/:id/results", isAuthenticated, getResults);
router.get("/:id", isAuthenticated, getQuizById);

export default router;
