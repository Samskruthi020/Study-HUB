import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import auth from '../middleware/authMiddleware.js';
const router = express.Router();

const storage = multer.diskStorage({});
const upload = multer({ storage });

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Registration failed:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'studyhubsecret', {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        joined: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login failed:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Upload profile image endpoint
router.post('/upload-profile-image', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Received upload request:', req.file, req.user);
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Find the user to get the old image URL
    const userDoc = await User.findById(req.user.id);
    if (userDoc && userDoc.profileImage) {
      // Extract public_id from the old Cloudinary URL
      const matches = userDoc.profileImage.match(/\/profile_images\/([^\.\/]+)\./);
      if (matches && matches[1]) {
        const oldPublicId = `profile_images/${matches[1]}`;
        try {
          await cloudinary.uploader.destroy(oldPublicId);
          console.log('Deleted old Cloudinary image:', oldPublicId);
        } catch (delErr) {
          console.warn('Failed to delete old Cloudinary image:', oldPublicId, delErr.message);
        }
      }
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile_images',
      public_id: `user_${req.user.id}_${Date.now()}`
    });
    console.log('Cloudinary result:', result);
    // Update user profileImage
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: result.secure_url },
      { new: true }
    );
    console.log('Updated user:', user);
    res.json({ imageUrl: result.secure_url, user });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Image upload failed', details: err.stack });
  }
});

// Get user profile with quiz history
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Check if streak should be reset due to missed days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (user.lastQuizDate) {
      const lastQuizDay = new Date(user.lastQuizDate);
      lastQuizDay.setHours(0, 0, 0, 0);
      
      // If last quiz was before yesterday, reset streak to 0
      if (lastQuizDay.getTime() < yesterday.getTime()) {
        user.currentStreak = 0;
        await user.save();
      }
    }
    
    console.log('Returning user profile:', user); // Debug log
    res.json({ user }); // user.profileImage should be present
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
});

// Get user streak information
router.get('/streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if streak should be reset due to missed days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (user.lastQuizDate) {
      const lastQuizDay = new Date(user.lastQuizDate);
      lastQuizDay.setHours(0, 0, 0, 0);
      
      console.log('Streak reset check:', {
        today: today.toISOString(),
        yesterday: yesterday.toISOString(),
        lastQuizDay: lastQuizDay.toISOString(),
        currentStreak: user.currentStreak
      });
      
      // If last quiz was before yesterday, reset streak to 0
      if (lastQuizDay.getTime() < yesterday.getTime()) {
        console.log('Resetting streak to 0 - missed a day');
        user.currentStreak = 0;
        await user.save();
      } else {
        console.log('Streak maintained - no missed days');
      }
    }

    // Sort streak history by date (newest first)
    const sortedHistory = user.streakHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastQuizDate: user.lastQuizDate,
      streakHistory: sortedHistory
    });
  } catch (err) {
    console.error('Error fetching streak info:', err);
    res.status(500).json({ error: 'Failed to fetch streak information', details: err.message });
  }
});

// Utility to get quiz history for a user
export async function getUserQuizHistory(userId) {
  const user = await User.findById(userId).select('quizHistory');
  return user ? user.quizHistory : [];
}

export default router;
