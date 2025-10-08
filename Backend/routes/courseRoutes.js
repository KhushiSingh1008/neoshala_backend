import express from 'express';
import Course from '../models/Course.js';
import CourseRating from '../models/CourseRating.js';
import CourseEnrollment from '../models/CourseEnrollment.js';
import mongoose from 'mongoose';
import { authenticateToken, isInstructor } from '../middlewares/authMiddleware.js';
import { sendCourseEnrollmentEmail } from '../services/emailService.js';
import { 
  createCoursePurchaseNotification, 
  createPaymentConfirmationNotification 
} from '../services/notificationService.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    // Only return approved courses to general public
    const courses = await Course.find({ 
      approvalStatus: 'approved',
      published: true 
    }).populate('instructor', 'username');
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get courses by instructor ID
router.get('/instructor/:id', async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.params.id })
      .populate('instructor', 'username')
      .populate('students', 'username');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrolled courses for a student
router.get('/student/:id', async (req, res) => {
  try {
    const courses = await Course.find({ students: req.params.id })
      .populate('instructor', 'username')
      .populate('students', 'username');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username')
      .populate('students', 'username');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create course - protected route for instructors only
router.post('/', authenticateToken, isInstructor, async (req, res) => {
  try {
    console.log('Creating new course with data:', req.body);
    
    // Validate required fields
    const requiredFields = [
      'title', 'instructor', 'location', 'description', 
      'duration', 'level', 'price', 'category', 
      'detailedDescription'
    ];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ 
          message: `Missing required field: ${field}`,
          field
        });
      }
    }
    
    // Verify that the instructor ID matches the authenticated user
    if (req.user.id !== req.body.instructor) {
      return res.status(403).json({ 
        message: 'You can only create courses for yourself'
      });
    }
    
    // Set default values if missing
    const courseData = {
      ...req.body,
      syllabus: req.body.syllabus || [],
      requirements: req.body.requirements || [],
      students: req.body.students || [],
      rating: 0,
      published: false,
      approvalStatus: 'pending'
    };
    
    // Create and save the course
    const course = new Course(courseData);
    
    const savedCourse = await course.save();
    console.log('Course created successfully:', savedCourse);
    
    // Get the instructor user to update their createdCourses array
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(
      req.body.instructor,
      { $addToSet: { createdCourses: savedCourse._id } }
    );
    
    // Return the created course with populated instructor
    const populatedCourse = await Course.findById(savedCourse._id)
      .populate('instructor', 'username email');
      
    res.status(201).json(populatedCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A course with this title already exists' 
      });
    }
    
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
});

// Update course - protected route for instructors only
router.put('/:id', authenticateToken, isInstructor, async (req, res) => {
  try {
    // First get the course to check ownership
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Verify that the instructor is the owner of the course
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'You can only update your own courses' 
      });
    }
    
    // Find course and update
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate key error', 
        field: Object.keys(error.keyPattern)[0] 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Partial update course - protected route for instructors only
router.patch('/:id', authenticateToken, isInstructor, async (req, res) => {
  try {
    // First get the course to check ownership
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Verify that the instructor is the owner of the course
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'You can only update your own courses' 
      });
    }
    
    // Find course and update
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Delete course - protected route for instructors only
router.delete('/:id', authenticateToken, isInstructor, async (req, res) => {
  try {
    // First get the course to check ownership
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Verify that the instructor is the owner of the course
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'You can only delete your own courses' 
      });
    }
    
    // Delete the course
    await Course.findByIdAndDelete(req.params.id);
    
    // Remove course from instructor's createdCourses array
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { createdCourses: req.params.id } }
    );
    
    res.json({ 
      message: 'Course deleted successfully',
      courseId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: error.message });
  }
});

// Enroll in course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id; // Get user ID from token
    const { paymentDetails } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId)
      .populate('instructor', 'username email');
      
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({ courseId, userId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Validate payment details
    if (!paymentDetails || !paymentDetails.transactionId) {
      return res.status(400).json({ message: 'Invalid payment details' });
    }

    // Create new enrollment record with payment details
    const enrollment = new CourseEnrollment({
      courseId,
      userId,
      paymentStatus: 'completed',
      paymentId: paymentDetails.paymentId,
      amountPaid: course.price,
      transactionId: paymentDetails.transactionId,
      paymentMethod: paymentDetails.paymentMethod,
      cardNumber: paymentDetails.cardNumber,
      cardholderName: paymentDetails.cardholderName,
      enrollmentDate: new Date(),
      status: 'active',
      progress: 0
    });

    // Save enrollment
    await enrollment.save();

    // Add student to course if not already added
    if (!course.students.includes(userId)) {
      course.students.push(userId);
      await course.save();
    }

    // Get user details for notification and email
    const User = mongoose.model('User');
    const user = await User.findById(userId);

    // Create notifications
    try {
      // Course purchase notification
      await createCoursePurchaseNotification(userId, course, {
        amount: course.price,
        currency: 'INR',
        transactionId: paymentDetails.transactionId,
        paymentMethod: paymentDetails.paymentMethod || 'card'
      });

      // Payment confirmation notification
      await createPaymentConfirmationNotification(userId, {
        amount: course.price,
        currency: 'INR',
        transactionId: paymentDetails.transactionId,
        paymentMethod: paymentDetails.paymentMethod || 'card'
      });

      console.log('Course purchase notifications created for user:', userId);
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't block the enrollment if notifications fail
    }

    // Send email notification if user has enabled email notifications
    try {
      if (user.emailNotifications) {
        await sendCourseEnrollmentEmail(
          user.email,
          user.username,
          course
        );
        console.log('Course enrollment email sent to:', user.email);
      } else {
        console.log('Email notifications are disabled for user:', userId);
      }
    } catch (emailError) {
      console.error('Error sending course enrollment email:', emailError);
      // Don't block the enrollment if email fails
    }

    // Return enrolled course with enrollment details
    const updatedCourse = await Course.findById(courseId)
      .populate('instructor', 'username')
      .populate('students', 'username');

    // Return both course and enrollment details
    res.status(201).json({
      course: updatedCourse,
      enrollment: enrollment,
      message: 'Enrollment successful! You should receive a confirmation email shortly.'
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get course enrollments
router.get('/:id/enrollments', async (req, res) => {
  try {
    const courseId = req.params.id;
    const enrollments = await CourseEnrollment.find({ courseId })
      .populate('userId', 'username email')
      .sort({ enrollmentDate: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user enrollments
router.get('/user/:userId/enrollments', async (req, res) => {
  try {
    const userId = req.params.userId;
    const enrollments = await CourseEnrollment.find({ userId })
      .populate('courseId')
      .sort({ enrollmentDate: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update enrollment status
router.patch('/:courseId/enrollment/:userId', async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    const { status, progress, completionDate } = req.body;

    const enrollment = await CourseEnrollment.findOne({ courseId, userId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (status) enrollment.status = status;
    if (progress !== undefined) enrollment.progress = progress;
    if (completionDate) enrollment.completionDate = completionDate;

    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rate course
router.post('/:id/rate', async (req, res) => {
  try {
    const courseId = req.params.id;
    const { rating, userId } = req.body;

    // First, check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is enrolled in the course
    if (!course.students.includes(userId)) {
      return res.status(403).json({ message: 'You must be enrolled in the course to rate it' });
    }

    // Try to find existing rating
    let courseRating = await CourseRating.findOne({ courseId, userId });

    if (courseRating) {
      // Update existing rating
      courseRating.rating = rating;
      courseRating.lastUpdated = new Date();
      await courseRating.save();
    } else {
      // Create new rating
      courseRating = new CourseRating({
        courseId,
        userId,
        rating,
        enrollmentDate: new Date()
      });
      await courseRating.save();
    }

    // Calculate new average rating
    const allRatings = await CourseRating.find({ courseId });
    const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allRatings.length;

    // Update course average rating
    course.rating = averageRating;
    await course.save();

    // Return updated course with user's rating
    const updatedCourse = await Course.findById(courseId)
      .populate('instructor', 'username')
      .populate('students', 'username');

    res.json({
      ...updatedCourse.toObject(),
      userRating: rating
    });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get course ratings
router.get('/:id/ratings', async (req, res) => {
  try {
    const courseId = req.params.id;
    const ratings = await CourseRating.find({ courseId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's rating for a course
router.get('/:id/rating/:userId', async (req, res) => {
  try {
    const { id: courseId, userId } = req.params;
    const rating = await CourseRating.findOne({ courseId, userId });
    res.json(rating || { rating: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check enrollment status for a course
router.get('/:id/enrollment-status', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.userId || req.user.id;

    console.log('🔍 Checking enrollment status - Course:', courseId, 'User:', userId);

    if (!userId) {
      return res.status(400).json({ message: 'Invalid user token' });
    }

    // Check if user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const isInstructor = course.instructor.toString() === userId;
    console.log('👨‍🏫 Is instructor:', isInstructor);
    
    // Check if user is enrolled (if not instructor)
    let isEnrolled = false;
    if (!isInstructor) {
      const enrollment = await CourseEnrollment.findOne({
        courseId: courseId,
        userId: userId
      });
      isEnrolled = !!enrollment;
      console.log('🎓 Is enrolled:', isEnrolled);
    }

    const result = { 
      isEnrolled: isEnrolled || isInstructor,
      isInstructor 
    };
    
    console.log('✅ Enrollment status result:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Error checking enrollment status:', error);
    res.status(500).json({ message: 'Server error while checking enrollment status' });
  }
});

// Get enrolled courses for authenticated user
router.get('/enrolled', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Enrolled courses request - User from token:', req.user);
    
    // Handle both userId and id fields for compatibility
    const userId = req.user.userId || req.user.id;
    
    if (!userId) {
      console.error('❌ No user ID found in token');
      return res.status(400).json({ message: 'Invalid user token' });
    }
    
    console.log('👤 Fetching enrollments for user ID:', userId);
    
    const enrollments = await CourseEnrollment.find({ userId })
      .populate({
        path: 'courseId',
        populate: {
          path: 'instructor',
          select: 'username'
        }
      })
      .sort({ enrollmentDate: -1 });

    console.log('📚 Found enrollments:', enrollments.length);

    if (enrollments.length === 0) {
      return res.json([]);
    }

    const enrolledCourses = enrollments.map(enrollment => {
      if (!enrollment.courseId) {
        console.warn('⚠️ Enrollment found but course is null:', enrollment._id);
        return null;
      }
      
      return {
        ...enrollment.courseId.toObject(),
        enrollmentDate: enrollment.enrollmentDate,
        progress: enrollment.progress,
        status: enrollment.status
      };
    }).filter(course => course !== null);

    console.log('✅ Returning enrolled courses:', enrolledCourses.length);
    res.json(enrolledCourses);
  } catch (error) {
    console.error('❌ Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Server error while fetching enrolled courses', error: error.message });
  }
});

export default router; 