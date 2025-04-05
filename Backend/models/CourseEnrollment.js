import mongoose from 'mongoose';

const courseEnrollmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  transactionId: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  },
  completionDate: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Create a compound index to ensure one enrollment per user per course
courseEnrollmentSchema.index({ courseId: 1, userId: 1 }, { unique: true });

const CourseEnrollment = mongoose.model('CourseEnrollment', courseEnrollmentSchema);

export { CourseEnrollment as default }; 