import express from 'express';
import Note from '../models/notes.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:subject', auth, async (req, res) => {
  const notes = await Note.find({ userId: req.user.id, subject: req.params.subject });
  res.json(notes);
});

router.post('/', auth, async (req, res) => {
  const { subject, content } = req.body;

  const updated = await Note.findOneAndUpdate(
    { userId: req.user.id, subject },
    { content },
    { upsert: true, new: true }
  );

  res.json(updated);
});

export default router;
