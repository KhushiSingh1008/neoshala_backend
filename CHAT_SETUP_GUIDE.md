# Neoshala Real-Time Chat Feature Setup Guide

This guide provides complete instructions for implementing the real-time chat feature in your Neoshala MERN stack project.

## Overview

The chat feature allows instructors and enrolled students to communicate in real-time within course-specific chat rooms. Messages are stored in MongoDB for persistence and accessed via Socket.IO for real-time updates.

## Backend Implementation

### 1. Dependencies Added

**Backend (`Backend/package.json`):**
```json
{
  "dependencies": {
    "socket.io": "^4.7.5"
  }
}
```

### 2. New Files Created

#### Message Model (`Backend/models/Message.js`)
- Stores chat messages with courseId, senderId, text, and timestamp
- Includes indexes for efficient querying
- Populates sender information for display

#### Chat Routes (`Backend/routes/chatRoutes.js`)
- `GET /api/chat/:courseId` - Fetch chat history for a course
- `POST /api/chat` - Save new messages
- Includes enrollment verification for security

### 3. Server Updates (`Backend/server.js`)

#### Socket.IO Integration
- HTTP server setup with Socket.IO
- JWT authentication middleware for Socket.IO connections
- Course room management (users join `course-{courseId}` rooms)
- Real-time message broadcasting
- Enrollment verification for room access

#### Key Features
- **Authentication**: JWT tokens required for Socket.IO connections
- **Room Management**: Users join course-specific rooms
- **Message Broadcasting**: Real-time message delivery to all room members
- **Security**: Only enrolled students and instructors can access course chats

### 4. Course Routes Updates (`Backend/routes/courseRoutes.js`)

#### New Endpoints
- `GET /api/courses/:id/enrollment-status` - Check if user is enrolled
- `GET /api/courses/enrolled` - Get user's enrolled courses

## Frontend Implementation

### 1. Dependencies Added

**Frontend (`Frontend/package.json`):**
```json
{
  "dependencies": {
    "socket.io-client": "^4.7.5"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.15",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49"
  }
}
```

### 2. Configuration Files

#### Tailwind CSS Setup
- `Frontend/tailwind.config.js` - Tailwind configuration
- `Frontend/postcss.config.js` - PostCSS configuration
- `Frontend/src/index.css` - Tailwind directives added

### 3. New Components

#### ChatRoom Component (`Frontend/src/components/ChatRoom.tsx`)
- Real-time Socket.IO connection with JWT authentication
- Message history fetching via REST API
- Real-time message updates
- Responsive design with Tailwind CSS
- Connection status indicators
- Auto-scroll to latest messages

#### Enrollment Service (`Frontend/src/services/enrollmentService.ts`)
- Check enrollment status
- Fetch enrolled courses

### 4. Updated Components

#### CourseDetailPage (`Frontend/src/pages/CourseDetailPage.tsx`)
- Enrollment status checking
- Chat toggle button for enrolled users
- ChatRoom component integration
- Conditional rendering based on enrollment

#### CourseDetailPage Styles (`Frontend/src/pages/CourseDetailPage.css`)
- Chat button styling
- Chat room section styling

## Installation Instructions

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd Backend
   npm install
   ```

2. **Environment Variables**
   Ensure your `.env` file includes:
   ```
   JWT_SECRET=your_jwt_secret
   MONGO_URI=your_mongodb_connection_string
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start Backend Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd Frontend
   npm install
   ```

2. **Environment Variables**
   Ensure your `.env` file includes:
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. **Start Frontend Server**
   ```bash
   npm run dev
   ```

## Usage Instructions

### For Students

1. **Enroll in a Course**
   - Browse courses and enroll in desired courses
   - Complete payment process

2. **Access Course Chat**
   - Navigate to enrolled course detail page
   - Click "Open Course Chat" button
   - Start chatting with instructor and other students

### For Instructors

1. **Access Course Chat**
   - Navigate to your course detail page
   - Click "Open Course Chat" button
   - Communicate with enrolled students

## Security Features

### Authentication
- JWT tokens required for all Socket.IO connections
- Token validation on both REST API and Socket.IO

### Authorization
- Only enrolled students and course instructors can access chat
- Enrollment verification on both client and server side
- Course-specific room isolation

### Data Validation
- Message text validation (non-empty, trimmed)
- Course existence verification
- User enrollment status verification

## Technical Details

### Socket.IO Events

#### Client to Server
- `join-course` - Join a course chat room
- `send-message` - Send a new message
- `leave-course` - Leave a course chat room

#### Server to Client
- `joined-course` - Confirmation of joining room
- `new-message` - New message broadcast
- `error` - Error notifications

### Database Schema

#### Message Collection
```javascript
{
  courseId: ObjectId, // Reference to Course
  senderId: ObjectId, // Reference to User
  text: String,       // Message content
  timestamp: Date,    // Message creation time
  createdAt: Date,    // MongoDB timestamp
  updatedAt: Date     // MongoDB timestamp
}
```

### API Endpoints

#### Chat Routes
- `GET /api/chat/:courseId` - Get chat history
- `POST /api/chat` - Send new message

#### Course Routes
- `GET /api/courses/:id/enrollment-status` - Check enrollment
- `GET /api/courses/enrolled` - Get enrolled courses

## Troubleshooting

### Common Issues

1. **Socket.IO Connection Failed**
   - Check JWT token validity
   - Verify backend server is running
   - Check CORS configuration

2. **Cannot Access Chat**
   - Verify user enrollment status
   - Check course existence
   - Ensure user is logged in

3. **Messages Not Appearing**
   - Check Socket.IO connection status
   - Verify room joining
   - Check browser console for errors

### Debug Mode

Enable debug logging by adding to your environment:
```
DEBUG=socket.io:*
```

## Performance Considerations

### Database Optimization
- Indexes on courseId and timestamp for efficient queries
- Message limit (100 messages) for chat history
- Pagination support for large chat histories

### Socket.IO Optimization
- Room-based broadcasting (only send to relevant users)
- Connection pooling
- Error handling and reconnection logic

## Future Enhancements

### Potential Features
- File/image sharing in chat
- Message reactions/emojis
- Typing indicators
- Message search functionality
- Chat notifications
- Message editing/deletion
- Private messaging between users

### Scalability
- Redis adapter for Socket.IO clustering
- Message archiving for old chats
- Rate limiting for message sending
- Chat moderation tools

## Testing

### Manual Testing Checklist
- [ ] User can join course chat room
- [ ] Messages are sent and received in real-time
- [ ] Chat history loads correctly
- [ ] Only enrolled users can access chat
- [ ] Connection status indicators work
- [ ] Error handling works properly
- [ ] Mobile responsiveness

### Automated Testing
Consider adding unit tests for:
- Message model validation
- Socket.IO event handling
- Enrollment verification logic
- Chat room access control

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check backend server logs
4. Verify database connections
5. Test with different user roles (student/instructor)

---

This implementation provides a robust, secure, and scalable real-time chat system for your Neoshala platform. The modular design allows for easy maintenance and future enhancements.
