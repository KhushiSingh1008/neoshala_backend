import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

dotenv.config();

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profile-pictures';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
  }
});

// ------------------- REGISTER -------------------
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });

    console.log('User created:', user);

    await sendVerificationEmail(email, verificationToken);

    const token = jwt.sign({ userId: user._id, id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      message: 'Registration successful! Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ------------------- LOGIN -------------------
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        location: user.location,
        age: user.age,
        bio: user.bio,
        profilePicture: user.profilePicture,
        emailNotifications: user.emailNotifications,
        isVerified: user.isVerified
      },
      message: user.isVerified ? 'Login successful!' : 'Please verify your email to access all features.'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ------------------- PROFILE -------------------
// Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update current user's profile (username, location, age, bio, emailNotifications)
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const allowedFields = ['username', 'location', 'age', 'bio', 'emailNotifications'];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const updated = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Internal handler to update picture shared by alias routes
async function handleProfilePictureUpdate(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const userId = req.user.userId || req.user.id;
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
    const updated = await User.findByIdAndUpdate(userId, { $set: { profilePicture: profilePictureUrl } }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile picture updated', profilePicture: profilePictureUrl, user: updated });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ message: error.message });
  }
}

// Update profile picture (primary route)
router.put('/me/profile-picture', authenticateToken, upload.single('profilePicture'), handleProfilePictureUpdate);

// Aliases to avoid 404s depending on client usage
router.post('/me/profile-picture', authenticateToken, upload.single('profilePicture'), handleProfilePictureUpdate);
router.put('/me/avatar', authenticateToken, upload.single('image'), handleProfilePictureUpdate);
router.post('/me/avatar', authenticateToken, upload.single('image'), handleProfilePictureUpdate);
router.put('/me/photo', authenticateToken, upload.single('file'), handleProfilePictureUpdate);
router.post('/me/photo', authenticateToken, upload.single('file'), handleProfilePictureUpdate);

// Backward-compatible aliases used by Frontend
router.put('/profile', authenticateToken, async (req, res) => {
  // Reuse the same logic as /me
  return (await router.handle.bind({})(req, res));
});

// Implement alias directly to avoid router recursion complexity
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const allowedFields = ['username', 'location', 'age', 'bio', 'emailNotifications'];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const updated = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (error) {
    console.error('Update profile (alias) error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/profile/picture', authenticateToken, upload.single('profilePicture'), handleProfilePictureUpdate);

// Email notifications toggle alias
router.patch('/notifications/email', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') return res.status(400).json({ message: 'enabled must be boolean' });
    const updated = await User.findByIdAndUpdate(userId, { $set: { emailNotifications: enabled } }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Email notifications updated', emailNotifications: updated.emailNotifications });
  } catch (error) {
    console.error('Update email notifications error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a user's courses by userId (alias used by Frontend)
router.get('/:userId/courses', authenticateToken, async (req, res) => {
  try {
    const userIdFromToken = req.user.userId || req.user.id;
    const { userId } = req.params;
    if (userIdFromToken !== userId) {
      return res.status(403).json({ message: 'You can only view your own courses' });
    }
    const enrollments = await mongoose.model('CourseEnrollment').find({ userId })
      .populate({ path: 'courseId', populate: { path: 'instructor', select: 'username' } })
      .sort({ enrollmentDate: -1 });
    const courses = enrollments
      .map(e => e.courseId ? { ...e.courseId.toObject(), enrollmentDate: e.enrollmentDate, progress: e.progress, status: e.status } : null)
      .filter(Boolean);
    res.json(courses);
  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
