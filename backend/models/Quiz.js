import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  subject: String,
  question: String,
  options: [String],
  answer: String,
});

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
