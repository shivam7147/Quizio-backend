import Quiz from "../models/quizModel.js";

export const createQuiz = async (req, res) => {
  try {
    const { title, questions, duration, visibleFrom, autoSubmitAt, expiresAt } = req.body;

    // Generate unique 6-digit code
    const generateUniqueCode = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Set default dates if not provided
    const now = new Date();
    const defaultVisibleFrom = visibleFrom || now;
    const defaultExpiresAt = expiresAt || new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now
    const defaultAutoSubmitAt = autoSubmitAt || new Date(now.getTime() + (duration || 60) * 60 * 1000); // duration minutes from now

    const shareId = generateUniqueCode();
    const uuid = generateUniqueCode();

    
    const newQuiz = await Quiz.create({
      title,
      questions,
      duration,
      visibleFrom: defaultVisibleFrom,
      autoSubmitAt: defaultAutoSubmitAt,
      expiresAt: defaultExpiresAt,
      createdBy: req.user.id,
      shareId: shareId,
      uuid: uuid,
    });

        
    res.status(201).json({ 
      message: "Quiz created", 
      quizId: newQuiz._id,
      shareId: newQuiz.shareId 
    });
  } catch (error) {
    // error logged for debugging, remove in prod
    res.status(500).json({ message: "Failed to create quiz", error: error.message });
  }
};

// Submit a quiz attempt
export const submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { answers, username, email } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Check if user has already attempted this quiz (robust: check by email or username)
    const existingAttempt = quiz.attempts.find(attempt => attempt.email === email || attempt.user === username);
    if (existingAttempt) {
      return res.status(400).json({ message: "You have already attempted this quiz" });
    }

    let score = 0;
    
    quiz.questions.forEach((q, i) => {
      const userAnswer = answers[i];
      const correctAnswerText = q.correctAnswer; // correctAnswer now stores the actual text
      
      
      
      // Compare the user's answer with the correct answer text
      if (userAnswer === correctAnswerText) {
        score++;
              } else {
              }
    });
    
    quiz.attempts.push({ user: username, email, score });
    await quiz.save();

    res.json({ score, totalQuestions: quiz.questions.length });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit quiz", error: error.message });
  }
};

// Get quiz results (only for creator)
// Enhanced: allow creator to see all attempts, allow participant to see their own attempt
export const getResults = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // If creator, return all attempts
    if (quiz.createdBy.toString() === req.user.id) {
      return res.json(quiz.attempts);
    }

    // If participant, return only their own attempt (match by email or user id)
    // Email can be sent as a query param or from req.user.email if available
    const participantEmail = req.user.email || req.query.email;
    if (participantEmail) {
      const attempt = quiz.attempts.find(a => a.email === participantEmail);
      if (attempt) {
        return res.json([attempt]);
      } else {
        return res.status(403).json({ message: "No attempt found for this user/email" });
      }
    }

    // If neither, deny access
    return res.status(403).json({ message: "Not authorized: Only the quiz creator or participants who attempted this quiz can view results." });
  } catch (error) {
    res.status(500).json({ message: "Failed to get results", error: error.message });
  }
};

export const getMyQuizzes = async (req, res) => {
  try {
    
    
    // First, let's check if there are any quizzes in the database at all
    const allQuizzes = await Quiz.find({});
    
    
    // Now check for quizzes by this specific user
    const quizzes = await Quiz.find({ createdBy: req.user.id })
      .select('title _id shareId attempts createdAt questions')
      .sort({ createdAt: -1 });
    
    
    res.json(quizzes);
  } catch (error) {
    
    res.status(500).json({ message: "Failed to fetch quizzes", error: error.message });
  }
};

// Fetch a quiz by its ID
export const getQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quiz", error: error.message });
  }
};

// Fetch a quiz by its shareId (unique code)
export const getQuizByShareId = async (req, res) => {
  try {
    const { shareId } = req.params;
    const quiz = await Quiz.findOne({ shareId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quiz by code", error: error.message });
  }
};


