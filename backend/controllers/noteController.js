import Note from "../models/Note.js";

export const getNotesBySubject = async (req, res) => {
  const { subjectId } = req.params;
  const notes = await Note.find({ subject: subjectId });
  res.json(notes);
};

export const addNote = async (req, res) => {
  const { subject, title, content } = req.body;
  const note = new Note({ subject, title, content, user: req.user.id });
  await note.save();
  res.json(note);
};
