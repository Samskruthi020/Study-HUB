import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  subject: String,
  score: Number,
  totalQuestions: Number,
  completedAt: { type: Date, default: Date.now },
  questions: [String],
  userAnswers: [String],
  correctAnswers: [String]
});

const streakHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  streakCount: { type: Number, required: true },
  quizzesCompleted: { type: Number, default: 1 }
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "admin"], default: "student" },
  quizHistory: [quizAttemptSchema],
  profileImage: { type: String, default: '' }, // Cloudinary image URL
  // Streak related fields
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastQuizDate: { type: Date, default: null },
  streakHistory: [streakHistorySchema]
}, { timestamps: true }); // <-- ✅ this enables createdAt & updatedAt fields

export default mongoose.model("User", userSchema);
