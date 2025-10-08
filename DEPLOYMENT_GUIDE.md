# 🚀 Deployment Guide - NeoShala Course Management System

This guide will help you deploy your full-stack application using GitHub Actions, Render (Backend), Vercel (Frontend), and MongoDB Atlas (Database).

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Vercel account (free tier available)
- MongoDB Atlas account (free tier available)
- Firebase project (for authentication)

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in to your account
3. Click "Create a New Cluster"
4. Choose the **FREE** tier (M0 Sandbox)
5. Select a cloud provider and region (choose closest to your users)
6. Name your cluster (e.g., "neoshala-cluster")
7. Click "Create Cluster"

### Step 2: Configure Database Access

1. In your Atlas dashboard, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

### Step 3: Configure Network Access

1. Go to "Network Access" in your Atlas dashboard
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for production
4. Click "Confirm"

### Step 4: Get Connection String

1. Go to "Clusters" and click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with "neoshala"

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/neoshala?retryWrites=true&w=majority`

## 🔧 Backend Deployment (Render)

### Step 1: Create Render Account

1. Go to [Render](https://render.com)
2. Sign up using your GitHub account

### Step 2: Deploy Backend Service

1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `neoshala-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd Backend && npm install`
   - **Start Command**: `cd Backend && npm start`
   - **Plan**: Free (or paid for better performance)

### Step 3: Set Environment Variables

In your Render service settings, add these environment variables:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/neoshala?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_jwt_secret_token_here_make_it_long_and_random
FRONTEND_URL=https://your-app-name.vercel.app
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://neoshala-backend.onrender.com`

## 🌐 Frontend Deployment (Vercel)

### Step 1: Create Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Sign up using your GitHub account

### Step 2: Deploy Frontend

1. In Vercel dashboard, click "New Project"
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Set Environment Variables

In your Vercel project settings, add these environment variables:

```env
VITE_API_URL=https://neoshala-backend.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL: `https://your-app-name.vercel.app`

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name (e.g., "neoshala-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In Firebase console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Save changes

### Step 3: Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location
5. Click "Done"

### Step 4: Get Configuration

1. Go to "Project settings" (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon
4. Register your app with a name
5. Copy the configuration object

### Step 5: Generate Service Account Key

1. Go to "Project settings" > "Service accounts"
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the required fields for your backend environment variables

## ⚙️ GitHub Actions Setup

### Step 1: Repository Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add these secrets:

**For Render:**
- `RENDER_API_KEY`: Your Render API key
- `RENDER_SERVICE_ID`: Your backend service ID from Render

**For Vercel:**
- `VERCEL_TOKEN`: Your Vercel token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

**For Frontend Build:**
- `VITE_API_URL`: Your backend URL
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID`: Firebase measurement ID

### Step 2: Enable Actions

1. Go to your repository's "Actions" tab
2. Enable GitHub Actions if not already enabled
3. The workflows will run automatically on push to main/master

## 🔄 Update Backend URL

After deploying your backend, update the `FRONTEND_URL` environment variable in Render with your actual Vercel URL.

## 🧪 Testing the Deployment

1. Visit your frontend URL
2. Test user registration and login
3. Test course creation and enrollment
4. Test real-time chat functionality
5. Verify email notifications work
6. Check admin functionality

## 📊 Monitoring and Maintenance

### Render Monitoring
- Check logs in Render dashboard
- Monitor resource usage
- Set up alerts for downtime

### Vercel Monitoring
- Check deployment logs
- Monitor build times
- Set up domain and SSL

### MongoDB Atlas Monitoring
- Monitor database performance
- Set up alerts for high usage
- Regular backups are automatic

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` is correctly set in backend
2. **Database Connection**: Verify MongoDB connection string and network access
3. **Environment Variables**: Double-check all environment variables are set
4. **Build Failures**: Check Node.js version compatibility
5. **Firebase Errors**: Verify Firebase configuration and service account

### Debug Steps

1. Check deployment logs in Render/Vercel
2. Verify environment variables are set correctly
3. Test API endpoints directly
4. Check browser console for frontend errors
5. Monitor database connections in Atlas

## 🎉 Success!

Your application should now be fully deployed and accessible at:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://neoshala-backend.onrender.com`
- **Database**: MongoDB Atlas cluster

The CI/CD pipeline will automatically deploy changes when you push to the main branch.
