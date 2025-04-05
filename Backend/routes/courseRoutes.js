import express from 'express';
import Course from '../models/Course.js';
import CourseRating from '../models/CourseRating.js';
import CourseEnrollment from '../models/CourseEnrollment.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'username');
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

// Create course
router.post('/', async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update course
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete course
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll in course
router.post('/:id/enroll', async (req, res) => {
  try {
    const courseId = req.params.id;
    const { userId, paymentDetails } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({ courseId, userId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create new enrollment record
    const enrollment = new CourseEnrollment({
      courseId,
      userId,
      paymentStatus: 'completed',
      paymentId: paymentDetails.paymentId,
      amountPaid: course.price,
      transactionId: paymentDetails.transactionId,
      paymentMethod: paymentDetails.paymentMethod
    });

    // Save enrollment
    await enrollment.save();

    // Add student to course
    if (!course.students.includes(userId)) {
      course.students.push(userId);
      await course.save();
    }

    // Return enrolled course with enrollment details
    const updatedCourse = await Course.findById(courseId)
      .populate('instructor', 'username')
      .populate('students', 'username');

    res.status(201).json({
      course: updatedCourse,
      enrollment: enrollment
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

export default router; 