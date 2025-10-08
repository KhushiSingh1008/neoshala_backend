import express from 'express';
import Message from '../models/Message.js';
import Course from '../models/Course.js';
import CourseEnrollment from '../models/CourseEnrollment.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get chat history for a specific course
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    // Check if user is enrolled in the course or is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    const isInstructor = course.instructor.toString() === userId;
    
    // Check if user is enrolled (if not instructor)
    let isEnrolled = false;
    if (!isInstructor) {
      const enrollment = await CourseEnrollment.findOne({
        courseId: courseId,
        userId: userId
      });
      isEnrolled = !!enrollment;
    }

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Access denied. You must be enrolled in this course to view messages.' });
    }

    // Fetch messages for the course, sorted by timestamp
    const messages = await Message.find({ courseId })
      .populate('senderId', 'username profilePicture')
      .sort({ timestamp: 1 })
      .limit(100); // Limit to last 100 messages for performance

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Server error while fetching chat history' });
  }
});

// Save a new message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { courseId, text } = req.body;
    const senderId = req.user.userId;

    if (!courseId || !text || text.trim() === '') {
      return res.status(400).json({ message: 'Course ID and message text are required' });
    }

    // Check if user is enrolled in the course or is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    const isInstructor = course.instructor.toString() === senderId;
    
    // Check if user is enrolled (if not instructor)
    let isEnrolled = false;
    if (!isInstructor) {
      const enrollment = await CourseEnrollment.findOne({
        courseId: courseId,
        userId: senderId
      });
      isEnrolled = !!enrollment;
    }

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Access denied. You must be enrolled in this course to send messages.' });
    }

    // Create new message
    const message = new Message({
      courseId,
      senderId,
      text: text.trim()
    });

    await message.save();

    // Populate sender information for response
    await message.populate('senderId', 'username profilePicture');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Server error while saving message' });
  }
});

export default router;
