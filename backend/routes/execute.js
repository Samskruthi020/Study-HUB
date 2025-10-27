import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

// Language mapping for Judge0
const languageMap = {
  python: 71, // Python 3
  java: 62,   // Java (OpenJDK 13)
};

const RAPIDAPI_KEY = process.env.JUDGE0_API_KEY || 'f8f245bd7emsh45eeafed0174eeap14ec33jsnddadebca7c23';

router.post('/', async (req, res) => {
  const { language, code } = req.body;
  const language_id = languageMap[language];
  if (!language_id) return res.status(400).json({ error: 'Unsupported language' });

  try {
    // Submit code to Judge0
    const submission = await axios.post('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      source_code: code,
      language_id,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
    });
    const { stdout, stderr, compile_output, message } = submission.data;
    res.json({
      output: stdout || '',
      error: stderr || compile_output || message || '',
    });
  } catch (err) {
    res.status(500).json({ error: 'Code execution failed', details: err.message });
  }
});

export default router; 