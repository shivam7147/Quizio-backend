import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [String],
  correctAnswer: { type: String, required: true },
});

const attemptSchema = new mongoose.Schema({
  user: { type: String, required: true }, // username
  email: { type: String, required: true }, // user email
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
  duration: Number,
  visibleFrom: Date,
  autoSubmitAt: Date,
  expiresAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attempts: [attemptSchema],
  shareId: { 
    type: String, 
    unique: true, 
    default: () => Math.floor(100000 + Math.random() * 900000).toString()
  },
  uuid: { 
    type: String, 
    unique: true, 
    default: () => Math.floor(100000 + Math.random() * 900000).toString()
  },
});

// Pre-save hook to remove duplicate attempts by email or username
quizSchema.pre('save', function(next) {
  if (this.attempts && this.attempts.length > 1) {
    const seen = new Map();
    this.attempts = this.attempts.filter(attempt => {
      const key = `${attempt.email}|${attempt.user}`;
      if (seen.has(key)) return false;
      seen.set(key, true);
      return true;
    });
  }
  next();
});

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
