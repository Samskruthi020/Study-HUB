import express from 'express';
import { getUserQuizHistory } from './auth.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: Calculate days between two dates
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

// Helper: Generate recommendations
function generateRecommendations({ quizHistory, examDate, subjects, mode }) {
  const today = new Date();
  const daysLeft = daysBetween(today, examDate);
  let html = '';

  if (mode === 'with-quiz' && quizHistory && quizHistory.length > 0) {
    // Analyze quiz history
    const attempted = quizHistory.filter(q => subjects.includes(q.subject));
    const avg = attempted.length ? Math.round(attempted.reduce((sum, q) => sum + (q.score / q.totalQuestions), 0) / attempted.length * 100) : 0;
    const weak = attempted.filter(q => (q.score / q.totalQuestions) < 0.6).map(q => q.subject);
    html += `<b>📅 Days until exam:</b> ${daysLeft}<br/>`;
    html += `<b>📊 Average score in selected subjects:</b> ${avg}%<br/>`;
    if (weak.length) {
      html += `<b>⚠️ Focus on weak subjects:</b> ${[...new Set(weak)].join(', ')}<br/>`;
    }
    html += `<b>📝 Suggested plan:</b> Attempt at least ${Math.ceil(subjects.length * 2)} quizzes per week.<br/>`;
    html += `<b>📚 Recommended resources:</b> Use the Resources tab for notes and practice.<br/>`;
    if (avg >= 80) {
      html += `<span class='text-success'>🎉 You are on track! Keep practicing and revise regularly.</span>`;
    } else if (avg >= 60) {
      html += `<span class='text-warning'>👍 Good progress, but focus on your weak areas for a better score.</span>`;
    } else {
      html += `<span class='text-danger'>🚨 You need more practice. Focus on quizzes and review your mistakes.</span>`;
    }
  } else {
    // General prediction
    html += `<b>📅 Days until exam:</b> ${daysLeft}<br/>`;
    html += `<b>📝 Suggested plan:</b> For ${subjects.length} subjects, aim for ${Math.ceil(subjects.length * 2)} quizzes per week.<br/>`;
    html += `<b>📚 Use the Resources tab</b> for notes and practice.<br/>`;
    if (daysLeft < 7) {
      html += `<span class='text-danger'>⏰ Exam is very soon! Focus on revision and practice quizzes daily.</span>`;
    } else if (daysLeft < 21) {
      html += `<span class='text-warning'>⚡ Prioritize your weakest subjects and take at least one quiz per day.</span>`;
    } else {
      html += `<span class='text-success'>✅ You have enough time. Make a weekly plan and stick to it!</span>`;
    }
  }
  return { html };
}

function generateMLPredictions({ examDate, subjects, stress, confidence, hoursPerDay }) {
  const today = new Date();
  const daysLeft = daysBetween(today, examDate);
  const nSubjects = subjects.length;
  // Simple ML-like logic (can be replaced with real model)
  let readiness = Math.max(0, Math.min(100, Math.round((confidence * 10) + (hoursPerDay * 2) - (stress * 3) + (daysLeft * 0.5) - (nSubjects * 2))));
  let burnout = Math.max(0, Math.min(100, Math.round((stress * 10) + (12 - hoursPerDay) * 2 + (nSubjects * 2))));
  let completion = Math.max(0, Math.min(100, Math.round((daysLeft / (nSubjects * 7)) * 100 - (stress * 2) + (confidence * 3))));
  let dailyStudy = Math.max(1, Math.round((nSubjects * 2) / (daysLeft / 7)));
  let advice = '';
  if (readiness >= 80) {
    advice += '🎉 <b>You are well prepared!</b> Keep up the good work and maintain your routine.';
  } else if (readiness >= 60) {
    advice += '👍 <b>You are on track.</b> Focus on your weak areas and avoid burnout.';
  } else {
    advice += '🚨 <b>You need to improve your preparation.</b> Increase your daily study hours and reduce distractions.';
  }
  if (burnout > 70) {
    advice += '<br/>⚠️ <b>High risk of burnout!</b> Take regular breaks and manage your stress.';
  }
  if (completion < 60) {
    advice += '<br/>⏰ <b>Low probability of syllabus completion.</b> Prioritize important topics and make a strict schedule.';
  }
  return { readiness, burnout, completion, dailyStudy, advice };
}

router.post('/', auth, async (req, res) => {
  try {
    const { examDate, subjects, mode, stress, confidence, hoursPerDay } = req.body;
    if (!examDate || !subjects || !Array.isArray(subjects) || !subjects.length) {
      return res.status(400).json({ message: 'Exam date and subjects are required.' });
    }
    if (mode === 'ml-predictor') {
      const result = generateMLPredictions({ examDate, subjects, stress, confidence, hoursPerDay });
      return res.json(result);
    }
    let quizHistory = [];
    if (mode === 'with-quiz') {
      quizHistory = await getUserQuizHistory(req.user.id);
    }
    const result = generateRecommendations({ quizHistory, examDate, subjects, mode });
    res.json(result);
  } catch (err) {
    console.error('AI Recommendations error:', err);
    res.status(500).json({ message: 'Failed to generate recommendations.' });
  }
});

export default router; 