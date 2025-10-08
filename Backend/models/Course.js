import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  // Instructor credential/certificate for verification by admin
  instructorCertificateUrl: {
    type: String
  },
  instructorCertificateStatus: {
    type: String,
    enum: ['not_provided', 'pending', 'approved', 'rejected'],
    default: 'not_provided'
  },
  instructorCertificateNotes: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true
  },
  detailedDescription: {
    type: String,
    required: true
  },
  syllabus: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  published: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Course', courseSchema); 