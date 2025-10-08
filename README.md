# 🎓 NeoShala Course Management System

A comprehensive full-stack platform for instructors to create courses and students to enroll in them, featuring real-time chat, payment processing, and admin moderation.

[![Deploy Status](https://github.com/your-username/your-repo/workflows/Deploy%20to%20Production/badge.svg)](https://github.com/your-username/your-repo/actions)
[![Security Scan](https://github.com/your-username/your-repo/workflows/Security%20Scan/badge.svg)](https://github.com/your-username/your-repo/actions)

## 🚀 Live Demo

- **Frontend**: [https://your-app-name.vercel.app](https://your-app-name.vercel.app)
- **Backend API**: [https://neoshala-backend.onrender.com](https://neoshala-backend.onrender.com)

## ✨ Features

### 👥 User Management
- **Multi-role Authentication** (Student, Instructor, Admin)
- **Firebase Authentication** integration
- **Profile Management** with picture uploads
- **Email Notifications** system

### 📚 Course Management
- **Course Creation** with rich content
- **Course Approval System** (Admin moderation)
- **Course Enrollment** with payment processing
- **Course Rating & Reviews**
- **Real-time Chat** for enrolled students

### 💳 Payment System
- **Secure Payment Processing**
- **Transaction History**
- **Enrollment Management**

### 🛡️ Admin Features
- **Admin Dashboard** with analytics
- **Course Approval/Rejection**
- **User Management**
- **System Statistics**

### 🔄 Real-time Features
- **Socket.IO Chat** for course discussions
- **Live Notifications**
- **Real-time Updates**

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.IO Client** for real-time features
- **Firebase SDK** for authentication

### Backend (Node.js + Express)
- **Node.js** with Express framework
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Multer** for file uploads
- **Nodemailer** for email notifications

### Database (MongoDB Atlas)
- **MongoDB Atlas** cloud database
- **Mongoose** schemas and models
- **Automated backups**
- **Performance monitoring**

### Deployment & CI/CD
- **GitHub Actions** for CI/CD
- **Vercel** for frontend deployment
- **Render** for backend deployment
- **MongoDB Atlas** for database hosting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account
- Firebase project
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/neoshala.git
   cd neoshala
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd Backend
   npm install
   
   # Install frontend dependencies
   cd ../Frontend
   npm install
   ```

3. **Set up environment variables**
   
   Create `Backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/neoshala
   JWT_SECRET=your_jwt_secret_here
   FRONTEND_URL=http://localhost:5173
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=your_email@gmail.com
   ```
   
   Create `Frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

4. **Start the development servers**
   ```bash
   # Start backend (in one terminal)
   cd Backend
   npm run dev
   
   # Start frontend (in another terminal)
   cd Frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 🌐 Production Deployment

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Quick Deploy Steps:

1. **Set up MongoDB Atlas** cluster
2. **Deploy Backend** to Render
3. **Deploy Frontend** to Vercel
4. **Configure GitHub Actions** for CI/CD
5. **Set up environment variables** in deployment platforms

## 🛠️ Development

### Project Structure
```
neoshala/
├── Frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
├── Backend/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middlewares/        # Custom middlewares
│   ├── services/           # Business logic
│   └── uploads/            # File uploads
├── .github/workflows/      # GitHub Actions
└── docs/                   # Documentation
```

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint (if configured)

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Admin Setup

Create an admin user:
```bash
cd Backend/scripts
npm install
npm run create-admin
```

Default admin credentials:
- **Username**: admin
- **Email**: admin@neoshala.com
- **Password**: Admin@123

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Course Endpoints
- `GET /api/courses` - Get all approved courses
- `POST /api/courses` - Create new course (instructor)
- `PUT /api/courses/:id` - Update course (instructor)
- `DELETE /api/courses/:id` - Delete course (instructor)
- `POST /api/courses/:id/enroll` - Enroll in course

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/courses/pending` - Pending courses
- `PUT /api/admin/courses/:id/approve` - Approve course
- `PUT /api/admin/courses/:id/reject` - Reject course

### Real-time Events (Socket.IO)
- `join-course` - Join course chat room
- `send-message` - Send chat message
- `new-message` - Receive new message
- `leave-course` - Leave course chat room

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Course creation and approval
- [ ] Course enrollment and payment
- [ ] Real-time chat functionality
- [ ] Email notifications
- [ ] File uploads
- [ ] Admin dashboard

## 🔒 Security Features

- **JWT Authentication** with secure tokens
- **CORS Protection** with allowed origins
- **Input Validation** and sanitization
- **File Upload Security** with type checking
- **Rate Limiting** (can be added)
- **Security Headers** (XSS, CSRF protection)

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `FRONTEND_URL` in backend environment
   - Check allowed origins in server.js

2. **Database Connection**
   - Verify MongoDB connection string
   - Check network access in MongoDB Atlas

3. **Firebase Errors**
   - Verify Firebase configuration
   - Check Firebase project settings

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all environment variables

### Debug Commands
```bash
# Check backend health
curl http://localhost:5000/health

# Check frontend build
cd Frontend && npm run build

# Check backend logs
cd Backend && npm start

# Test database connection
cd Backend && node -e "require('./server.js')"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Firebase for authentication services
- MongoDB for the database platform
- Vercel and Render for hosting services

## 📞 Support

For support, email support@neoshala.com or create an issue in the GitHub repository.

---

**Made with ❤️ by the NeoShala Team**