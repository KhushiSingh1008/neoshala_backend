import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import Course from '../models/Course.js';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';
import dotenv from 'dotenv';
import { authenticateToken } from '../middlewares/authMiddleware.js';

dotenv.config();

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-pictures';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    const { username, email, password, role } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });

    await user.save();
    console.log('User created successfully:', user);

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

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

// Verify Email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token'
      });
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.username);

    res.status(200).json({ 
      message: 'Email verified successfully! You can now log in to your account.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ 
      message: 'Verification email resent successfully! Please check your email.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

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
    res.status(500).json({ message: error.message });
  }
});

// After login route
// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Update user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ 
      message: 'Password reset email sent successfully! Please check your email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ 
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const { username, email, location, age, bio, emailNotifications } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (location) user.location = location;
    if (age) user.age = age;
    if (bio) user.bio = bio;
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;

    await user.save();

    res.json({
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
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload profile picture
router.post('/profile/picture', upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('Received profile picture upload request');
    console.log('File:', req.file);
    
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.id);
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      const oldPicturePath = path.join(process.cwd(), user.profilePicture);
      console.log('Attempting to delete old picture:', oldPicturePath);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
        console.log('Old picture deleted successfully');
      }
    }

    // Update user's profile picture path
    const profilePicturePath = '/uploads/profile-pictures/' + req.file.filename;
    console.log('New profile picture path:', profilePicturePath);
    user.profilePicture = profilePicturePath;
    await user.save();
    console.log('User updated with new profile picture');

    // Send response with full URL
    const fullProfilePictureUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}${profilePicturePath}`;
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        location: user.location,
        age: user.age,
        bio: user.bio,
        profilePicture: fullProfilePictureUrl,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user favorites - protected route
router.get('/:userId/favorites', authenticateToken, async (req, res) => {
  try {
    // Ensure the user can only access their own favorites
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.userId)
      .populate({
        path: 'favorites',
        populate: {
          path: 'instructor',
          select: 'username _id'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add course to favorites - protected route
router.post('/:userId/favorites/:courseId', authenticateToken, async (req, res) => {
  try {
    // Ensure the user can only modify their own favorites
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (user.favorites.includes(req.params.courseId)) {
      return res.status(400).json({ message: 'Course already in favorites' });
    }

    user.favorites.push(req.params.courseId);
    await user.save();

    res.json({ message: 'Course added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove course from favorites - protected route
router.delete('/:userId/favorites/:courseId', authenticateToken, async (req, res) => {
  try {
    // Ensure the user can only modify their own favorites
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favorites.includes(req.params.courseId)) {
      return res.status(400).json({ message: 'Course not in favorites' });
    }

    user.favorites = user.favorites.filter(id => id.toString() !== req.params.courseId);
    await user.save();

    res.json({ message: 'Course removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update email notification settings
router.patch('/notifications/email', authenticateToken, async (req, res) => {
  try {
    console.log('Received email notification update request:', req.body);
    const { enabled } = req.body;
    
    if (enabled === undefined) {
      return res.status(400).json({ message: 'Enabled status is required' });
    }

    // Convert to boolean to ensure consistent data type
    const enabledBool = enabled === true;
    
    console.log('User ID:', req.user.id, 'Setting email notifications to:', enabledBool);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update notification settings
    user.emailNotifications = enabledBool;
    await user.save();

    console.log('Updated user:', user._id, 'Email notifications:', user.emailNotifications);

    res.json({
      message: enabledBool ? 'Email notifications enabled' : 'Email notifications disabled',
      emailNotifications: user.emailNotifications
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 