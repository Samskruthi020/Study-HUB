import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  subject: { type: String, required: true },
  content: String,
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
