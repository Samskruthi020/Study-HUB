import Subject from "../models/Subject.js";

export const getSubjects = async (req, res) => {
  const subjects = await Subject.find();
  res.json(subjects);
};

export const addSubject = async (req, res) => {
  const { name, description } = req.body;
  const subject = new Subject({ name, description });
  await subject.save();
  res.json(subject);
};
