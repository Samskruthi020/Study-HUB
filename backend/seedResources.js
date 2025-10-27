import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Resource from './models/Resource.js';

dotenv.config();

const seedResources = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const data = JSON.parse(fs.readFileSync('./resources.json', 'utf-8'));

    await Resource.deleteMany(); // optional: clear old data
    await Resource.insertMany(data);

    console.log('✅ Resources inserted successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error inserting resources:', err);
    process.exit(1);
  }
};

seedResources();
