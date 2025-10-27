import Quiz from '../models/Quiz.js';

export const getQuizBySubject = async (req, res) => {
  try {
    const subject = req.params.subject;
    const quiz = await Quiz.find({
      subject: { $regex: new RegExp(`^${subject}$`, 'i') }
    });

    if (!quiz || quiz.length === 0) {
      return res.status(404).json({ message: `No quiz questions found for ${subject}` });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
