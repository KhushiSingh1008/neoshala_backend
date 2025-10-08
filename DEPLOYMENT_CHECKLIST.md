# 🚀 Deployment Checklist

Use this checklist to ensure your NeoShala application is properly deployed and all functionality works correctly.

## 📋 Pre-Deployment Setup

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create a new cluster (M0 Free tier)
- [ ] Create database user with read/write permissions
- [ ] Configure network access (allow all IPs: 0.0.0.0/0)
- [ ] Get connection string
- [ ] Test connection from local environment

### 2. Firebase Setup
- [ ] Create Firebase project
- [ ] Enable Authentication with Email/Password
- [ ] Create Firestore database
- [ ] Get Firebase configuration object
- [ ] Generate service account key for backend
- [ ] Test Firebase authentication locally

### 3. Email Service Setup (Gmail)
- [ ] Enable 2-factor authentication on Gmail
- [ ] Generate app password
- [ ] Test email sending locally

## 🔧 Backend Deployment (Render)

### 1. Render Account Setup
- [ ] Create Render account
- [ ] Connect GitHub repository

### 2. Backend Service Configuration
- [ ] Create new Web Service
- [ ] Set build command: `cd Backend && npm install`
- [ ] Set start command: `cd Backend && npm start`
- [ ] Choose Free plan (or paid for better performance)

### 3. Environment Variables Setup
Set these environment variables in Render:

- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neoshala?retryWrites=true&w=majority`
- [ ] `JWT_SECRET=your_very_secure_jwt_secret_token_here`
- [ ] `FRONTEND_URL=https://your-app-name.vercel.app`
- [ ] `EMAIL_SERVICE=gmail`
- [ ] `EMAIL_USERNAME=your_email@gmail.com`
- [ ] `EMAIL_PASSWORD=your_app_password`
- [ ] `EMAIL_FROM=your_email@gmail.com`
- [ ] `FIREBASE_PROJECT_ID=your-firebase-project-id`
- [ ] `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase private key\n-----END PRIVATE KEY-----\n"`
- [ ] `FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`

### 4. Deployment Verification
- [ ] Deploy service and wait for completion
- [ ] Check deployment logs for errors
- [ ] Test health endpoint: `https://your-backend.onrender.com/health`
- [ ] Verify database connection in logs

## 🌐 Frontend Deployment (Vercel)

### 1. Vercel Account Setup
- [ ] Create Vercel account
- [ ] Connect GitHub repository

### 2. Frontend Project Configuration
- [ ] Import GitHub repository
- [ ] Set framework preset to "Vite"
- [ ] Set root directory to "Frontend"
- [ ] Set build command to "npm run build"
- [ ] Set output directory to "dist"

### 3. Environment Variables Setup
Set these environment variables in Vercel:

- [ ] `VITE_API_URL=https://your-backend.onrender.com`
- [ ] `VITE_FIREBASE_API_KEY=your_firebase_api_key`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com`
- [ ] `VITE_FIREBASE_PROJECT_ID=your-firebase-project-id`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID=123456789`
- [ ] `VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX`

### 4. Deployment Verification
- [ ] Deploy and wait for completion
- [ ] Check build logs for errors
- [ ] Access frontend URL
- [ ] Verify all pages load correctly

## ⚙️ GitHub Actions Setup

### 1. Repository Secrets
Add these secrets in GitHub repository settings:

**Render Secrets:**
- [ ] `RENDER_API_KEY` - Your Render API key
- [ ] `RENDER_SERVICE_ID` - Your backend service ID

**Vercel Secrets:**
- [ ] `VERCEL_TOKEN` - Your Vercel token
- [ ] `VERCEL_ORG_ID` - Your Vercel organization ID
- [ ] `VERCEL_PROJECT_ID` - Your Vercel project ID

**Frontend Build Secrets:**
- [ ] `VITE_API_URL` - Backend URL
- [ ] `VITE_FIREBASE_API_KEY` - Firebase API key
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- [ ] `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- [ ] `VITE_FIREBASE_APP_ID` - Firebase app ID
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID

### 2. Workflow Verification
- [ ] Push changes to main branch
- [ ] Check GitHub Actions tab
- [ ] Verify all workflows pass
- [ ] Check deployment status

## 🧪 Post-Deployment Testing

### 1. Basic Functionality
- [ ] Frontend loads without errors
- [ ] Backend health check responds
- [ ] Database connection established

### 2. Authentication Testing
- [ ] User registration works
- [ ] User login works
- [ ] Firebase authentication functional
- [ ] JWT tokens generated correctly

### 3. Course Management Testing
- [ ] Course creation works (instructor)
- [ ] Course approval system works (admin)
- [ ] Course listing displays correctly
- [ ] Course enrollment works
- [ ] Payment processing works

### 4. Real-time Features Testing
- [ ] Socket.IO connection established
- [ ] Chat functionality works
- [ ] Real-time notifications work
- [ ] Course room joining/leaving works

### 5. File Upload Testing
- [ ] Profile picture upload works
- [ ] Course image upload works
- [ ] Files served correctly from backend

### 6. Email Notifications Testing
- [ ] Registration emails sent
- [ ] Course enrollment emails sent
- [ ] Admin notification emails sent
- [ ] Email preferences work

### 7. Admin Features Testing
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Course approval/rejection works
- [ ] User management works

## 🔄 Final Configuration Updates

### 1. Update Backend FRONTEND_URL
- [ ] Update `FRONTEND_URL` in Render with actual Vercel URL
- [ ] Redeploy backend service
- [ ] Test CORS functionality

### 2. Update Frontend API_URL
- [ ] Verify `VITE_API_URL` points to Render backend
- [ ] Redeploy frontend if needed
- [ ] Test API connectivity

### 3. Database Optimization
- [ ] Create database indexes for performance
- [ ] Set up database monitoring
- [ ] Configure backup schedules

## 🚨 Troubleshooting Common Issues

### CORS Errors
- [ ] Verify `FRONTEND_URL` is correctly set in backend
- [ ] Check allowed origins in server.js
- [ ] Ensure both HTTP and HTTPS variants are allowed

### Database Connection Issues
- [ ] Verify MongoDB connection string format
- [ ] Check network access settings in Atlas
- [ ] Verify database user permissions

### Build Failures
- [ ] Check Node.js version compatibility
- [ ] Verify all environment variables are set
- [ ] Check for missing dependencies

### Firebase Authentication Issues
- [ ] Verify Firebase configuration
- [ ] Check Firebase project settings
- [ ] Ensure service account key is correct

## ✅ Success Criteria

Your deployment is successful when:

- [ ] Frontend loads at Vercel URL without errors
- [ ] Backend responds at Render URL
- [ ] Database connection is established
- [ ] User registration and login work
- [ ] Course creation and enrollment work
- [ ] Real-time chat functions properly
- [ ] Email notifications are sent
- [ ] Admin features are accessible
- [ ] File uploads work correctly
- [ ] GitHub Actions deploy automatically

## 📊 Performance Monitoring

### Set up monitoring for:
- [ ] Backend response times
- [ ] Database query performance
- [ ] Frontend load times
- [ ] Error rates and logging
- [ ] User engagement metrics

## 🎉 Deployment Complete!

Once all items are checked, your NeoShala application is fully deployed and ready for production use!

**Frontend URL**: https://your-app-name.vercel.app
**Backend URL**: https://your-backend.onrender.com
**Admin Panel**: https://your-app-name.vercel.app/admin

Remember to:
- Monitor application performance
- Keep dependencies updated
- Regularly backup your database
- Monitor security vulnerabilities
- Scale resources as needed
