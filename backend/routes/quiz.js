import express from 'express';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Shuffle array function
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Streak calculation utility
const calculateStreak = (user, quizDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const quizDay = new Date(quizDate);
  quizDay.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let newCurrentStreak = 0;
  let newLongestStreak = user.longestStreak;
  
  console.log('Streak calculation:', {
    today: today.toISOString(),
    quizDay: quizDay.toISOString(),
    yesterday: yesterday.toISOString(),
    lastQuizDate: user.lastQuizDate ? new Date(user.lastQuizDate).toISOString() : 'none',
    currentStreak: user.currentStreak
  });
  
  // Check if this is the first quiz ever
  if (!user.lastQuizDate) {
    newCurrentStreak = 1;
    newLongestStreak = 1;
    console.log('First quiz ever - streak set to 1');
  } else {
    const lastQuizDay = new Date(user.lastQuizDate);
    lastQuizDay.setHours(0, 0, 0, 0);
    
    // If quiz is from today
    if (quizDay.getTime() === today.getTime()) {
      // If already completed a quiz today, keep current streak
      if (lastQuizDay.getTime() === today.getTime()) {
        newCurrentStreak = user.currentStreak;
        console.log('Already completed quiz today - keeping streak:', user.currentStreak);
      } else {
        // First quiz of the day
        if (lastQuizDay.getTime() === yesterday.getTime()) {
          // Consecutive day - continue streak
          newCurrentStreak = user.currentStreak + 1;
          console.log('Consecutive day - increasing streak to:', newCurrentStreak);
        } else if (lastQuizDay.getTime() < yesterday.getTime()) {
          // Missed a day or more - reset streak to 1
          newCurrentStreak = 1;
          console.log('Missed a day - resetting streak to 1');
        } else {
          // Future date or same day - keep current streak
          newCurrentStreak = user.currentStreak;
          console.log('Future date or same day - keeping streak:', user.currentStreak);
        }
      }
    } else {
      // Quiz is not from today - don't affect current streak
      newCurrentStreak = user.currentStreak;
      console.log('Quiz not from today - keeping streak:', user.currentStreak);
    }
  }
  
  // Update longest streak if current streak is longer
  if (newCurrentStreak > newLongestStreak) {
    newLongestStreak = newCurrentStreak;
    console.log('New longest streak:', newLongestStreak);
  }
  
  console.log('Final streak calculation:', { newCurrentStreak, newLongestStreak });
  return { newCurrentStreak, newLongestStreak };
};

// Check and reset streak if user missed a day
const checkAndResetStreak = (user) => {
  if (!user.lastQuizDate) return user;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastQuizDay = new Date(user.lastQuizDate);
  lastQuizDay.setHours(0, 0, 0, 0);
  
  // If last quiz was before yesterday, reset streak to 0
  if (lastQuizDay.getTime() < yesterday.getTime()) {
    user.currentStreak = 0;
  }
  
  return user;
};

router.get('/:subject', async (req, res) => {
  try {
    const subject = req.params.subject;
    const regex = new RegExp(`^${subject}$`, 'i');
    const questions = await Quiz.find({ subject: regex });

    if (questions.length === 0) {
      return res.status(404).json({ message: `No quiz questions found for ${subject}` });
    }

    // Double shuffle for better randomization on repeat attempts
    const firstShuffle = shuffleArray(questions);
    const finalShuffled = shuffleArray(firstShuffle).slice(0, Math.min(20, questions.length));
    
    console.log(`Serving ${finalShuffled.length} shuffled questions for ${subject}`);
    res.json(finalShuffled);
  } catch (error) {
    console.error('Error fetching quiz questions:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save quiz result to user profile
router.post('/save-result', auth, async (req, res) => {
  try {
    const { subject, score, totalQuestions, questions, userAnswers, correctAnswers } = req.body;
    const userId = req.user.id;
    const quizDate = new Date();

    console.log('Saving quiz result:', { userId, subject, score, totalQuestions });

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate new streak
    const { newCurrentStreak, newLongestStreak } = calculateStreak(user, quizDate);

    // Add quiz result to user's history
    user.quizHistory.push({
      subject,
      score,
      totalQuestions,
      completedAt: quizDate,
      questions: questions || [],
      userAnswers: userAnswers || [],
      correctAnswers: correctAnswers || []
    });

    // Update streak information
    user.currentStreak = newCurrentStreak;
    user.longestStreak = newLongestStreak;
    user.lastQuizDate = quizDate;

    // Add to streak history if this is a new day or streak changed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingHistoryEntry = user.streakHistory.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (existingHistoryEntry) {
      // Update existing entry for today
      existingHistoryEntry.streakCount = newCurrentStreak;
      existingHistoryEntry.quizzesCompleted += 1;
    } else {
      // Add new entry for today
      user.streakHistory.push({
        date: today,
        streakCount: newCurrentStreak,
        quizzesCompleted: 1
      });
    }

    await user.save();
    console.log('Quiz result and streak saved successfully for user:', userId);
    res.json({ 
      message: 'Quiz result saved successfully',
      streak: {
        current: newCurrentStreak,
        longest: newLongestStreak
      }
    });
  } catch (error) {
    console.error('Error saving quiz result:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
