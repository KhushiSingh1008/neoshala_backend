import express from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';
import { createCourseRejectionNotification } from '../services/notificationService.js';

const router = express.Router();

// Get all pending courses for admin approval
router.get('/courses/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const pendingCourses = await Course.find({ approvalStatus: 'pending' })
      .populate('instructor', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(pendingCourses);
  } catch (error) {
    console.error('Error fetching pending courses:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all courses with any approval status (admin dashboard)
router.get('/courses', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    // Filter by status if provided
    const filter = status ? { approvalStatus: status } : {};
    
    const courses = await Course.find(filter)
      .populate('instructor', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses for admin:', error);
    res.status(500).json({ message: error.message });
  }
});

// Approve a course
router.patch('/courses/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Update course approval status
    course.approvalStatus = 'approved';
    course.approvedBy = req.user.id;
    course.approvedAt = new Date();
    course.published = true;
    
    await course.save();
    
    // Return updated course
    const updatedCourse = await Course.findById(req.params.id)
      .populate('instructor', 'username email')
      .populate('approvedBy', 'username');
    
    res.json({ 
      message: 'Course approved successfully', 
      course: updatedCourse 
    });
  } catch (error) {
    console.error('Error approving course:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reject a course
router.patch('/courses/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Update course approval status
    course.approvalStatus = 'rejected';
    course.rejectionReason = rejectionReason;
    course.published = false;
    
    await course.save();
    
    // Get updated course with instructor details
    const updatedCourse = await Course.findById(req.params.id)
      .populate('instructor', 'username email');
    
    // Create notification for the instructor
    await createCourseRejectionNotification(
      course.instructor.toString(), 
      updatedCourse, 
      rejectionReason
    );
    
    res.json({ 
      message: 'Course rejected', 
      course: updatedCourse 
    });
  } catch (error) {
    console.error('Error rejecting course:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get admin dashboard statistics
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const pendingCourses = await Course.countDocuments({ approvalStatus: 'pending' });
    const approvedCourses = await Course.countDocuments({ approvalStatus: 'approved' });
    const rejectedCourses = await Course.countDocuments({ approvalStatus: 'rejected' });
    
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('instructor', 'username');
    
    res.json({
      statistics: {
        totalCourses,
        pendingCourses,
        approvedCourses,
        rejectedCourses,
        totalInstructors,
        totalStudents
      },
      recentCourses
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 