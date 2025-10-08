import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import Message from './models/Message.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import Course from './models/Course.js';
import CourseEnrollment from './models/CourseEnrollment.js';
import fs from 'fs';

dotenv.config();

const app = express();
const server = createServer(app);

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure CORS
// Support multiple explicit URLs via FRONTEND_URLS (comma-separated) and a primary FRONTEND_URL
const explicitOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',').map(s => s.trim()) : []),
  'http://localhost:5173',
  'http://localhost:3000',
  'https://localhost:5173'
].filter(Boolean);

// Allow common hosted domains (Vercel previews and Render) via regex checks
const originRegexAllowList = [
  /^https?:\/\/([\w-]+)\.vercel\.app$/i,        // *.vercel.app
  /^https?:\/\/([\w-]+)\.onrender\.com$/i       // *.onrender.com
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps or curl)
    if (!origin) return callback(null, true);

    if (explicitOrigins.includes(origin)) return callback(null, true);

    // Test regex allow list
    for (const regex of originRegexAllowList) {
      if (regex.test(origin)) return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
// Handle preflight globally
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const profilePicturesDir = path.join(uploadsDir, 'profile-pictures');
if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir, { recursive: true });
}

const courseImagesDir = path.join(uploadsDir, 'course-images');
if (!fs.existsSync(courseImagesDir)) {
  fs.mkdirSync(courseImagesDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (explicitOrigins.includes(origin)) return callback(null, true);
      for (const regex of originRegexAllowList) {
        if (regex.test(origin)) return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log(`User ${socket.userId} connected to Socket.IO`);

  // Join course room
  socket.on('join-course', async (courseId) => {
    try {
      // Verify user has access to this course
      const course = await Course.findById(courseId);
      if (!course) {
        socket.emit('error', { message: 'Course not found' });
        return;
      }

      // Check if user is instructor or enrolled
      const isInstructor = course.instructor.toString() === socket.userId;
      let isEnrolled = false;
      
      if (!isInstructor) {
        const enrollment = await CourseEnrollment.findOne({
          courseId: courseId,
          userId: socket.userId
        });
        isEnrolled = !!enrollment;
      }

      if (!isInstructor && !isEnrolled) {
        socket.emit('error', { message: 'Access denied. You must be enrolled in this course.' });
        return;
      }

      socket.join(`course-${courseId}`);
      socket.emit('joined-course', { courseId });
      console.log(`User ${socket.userId} joined course room: course-${courseId}`);
    } catch (error) {
      console.error('Error joining course room:', error);
      socket.emit('error', { message: 'Error joining course room' });
    }
  });

  // Handle new messages
  socket.on('send-message', async (data) => {
    try {
      const { courseId, text } = data;
      
      if (!courseId || !text || text.trim() === '') {
        socket.emit('error', { message: 'Course ID and message text are required' });
        return;
      }

      // Verify user has access to this course
      const course = await Course.findById(courseId);
      if (!course) {
        socket.emit('error', { message: 'Course not found' });
        return;
      }

      // Check if user is instructor or enrolled
      const isInstructor = course.instructor.toString() === socket.userId;
      let isEnrolled = false;
      
      if (!isInstructor) {
        const enrollment = await CourseEnrollment.findOne({
          courseId: courseId,
          userId: socket.userId
        });
        isEnrolled = !!enrollment;
      }

      if (!isInstructor && !isEnrolled) {
        socket.emit('error', { message: 'Access denied. You must be enrolled in this course.' });
        return;
      }

      // Create and save message
      const message = new Message({
        courseId,
        senderId: socket.userId,
        text: text.trim()
      });

      await message.save();
      await message.populate('senderId', 'username profilePicture');

      // Broadcast message to all users in the course room
      io.to(`course-${courseId}`).emit('new-message', message);
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Leave course room
  socket.on('leave-course', (courseId) => {
    socket.leave(`course-${courseId}`);
    console.log(`User ${socket.userId} left course room: course-${courseId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected from Socket.IO`);
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate field value'
    });
  }
  
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neoshala';

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    // Ensure at least one admin user exists
    (async () => {
      try {
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (!existingAdmin) {
          const adminUsername = process.env.ADMIN_USERNAME || 'admin';
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@neoshala.com';
          const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(adminPassword, salt);
          await User.create({
            username: adminUsername,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            emailNotifications: true,
            createdAt: new Date()
          });
          console.log('👑 Admin user auto-provisioned');
          console.log(`   Username: ${adminUsername}`);
          console.log(`   Email: ${adminEmail}`);
        }
      } catch (seedErr) {
        console.error('Error ensuring admin user exists:', seedErr);
      }
    })();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`📊 MongoDB Compass connection string: ${MONGO_URI}`);
      console.log(`🔌 Socket.IO server initialized`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Please ensure MongoDB is running and the connection string is correct');
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}); 