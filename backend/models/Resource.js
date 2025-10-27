import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  category: String,
  title: String,
  type: String,
  link: String
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
