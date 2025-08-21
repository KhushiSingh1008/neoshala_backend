# MongoDB Setup Guide

## 🔧 MongoDB Compass Connection

### Step 1: Install MongoDB Community Server
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB with default settings
3. MongoDB will run on `localhost:27017` by default

### Step 2: Install MongoDB Compass
1. Download MongoDB Compass from: https://www.mongodb.com/try/download/compass
2. Install and open MongoDB Compass

### Step 3: Connect to Your Database
1. Open MongoDB Compass
2. Use this connection string: `mongodb://localhost:27017/neoshala`
3. Click "Connect"

### Step 4: Verify Connection
You should see:
- Database name: `neoshala`
- Collections: `courses`, `users`, `courseenrollments`, `courseratings`, `notifications`

## 🚀 Starting Your Application

### Backend Setup:
```bash
cd Backend
npm install
npm start
```

### Frontend Setup:
```bash
cd Frontend
npm install
npm run dev
```

## 📊 Sample Data

To populate your database with sample courses, run:
```bash
cd Backend
node scripts/seedData.js
```

This will create:
- 5 sample courses
- 2 sample instructors
- All courses will be approved and published

## 🔍 Troubleshooting

### MongoDB Connection Issues:
1. **Error: "MongoNetworkError"**
   - Ensure MongoDB service is running
   - Check if port 27017 is available
   - Try restarting MongoDB service

2. **Error: "Authentication failed"**
   - Use connection string without username/password for local development
   - Connection string: `mongodb://localhost:27017/neoshala`

3. **Error: "Database not found"**
   - MongoDB creates databases automatically when first document is inserted
   - Run the seed script to create sample data

### Backend Connection Issues:
1. **Check .env file exists** in Backend folder
2. **Verify MONGO_URI** in .env: `MONGO_URI=mongodb://localhost:27017/neoshala`
3. **Check console logs** for connection status

## 📋 Environment Variables

Create `.env` file in Backend folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/neoshala
JWT_SECRET=your_very_secure_jwt_secret_token_12345
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

## 🎯 Testing the Setup

1. **Start MongoDB** (usually starts automatically after installation)
2. **Start Backend**: `cd Backend && npm start`
3. **Start Frontend**: `cd Frontend && npm run dev`
4. **Open MongoDB Compass** and connect to `mongodb://localhost:27017/neoshala`
5. **Visit**: http://localhost:5173
6. **Test course fetching** by going to "Explore Courses"

## 📈 Expected Results

After successful setup:
- ✅ Backend connects to MongoDB
- ✅ Frontend loads without errors
- ✅ Courses are displayed in Explore page
- ✅ User authentication works
- ✅ MongoDB Compass shows your data

## 🔧 MongoDB Compass Features

Use MongoDB Compass to:
- View all collections and documents
- Run queries to test data
- Monitor database performance
- Import/export data
- Create indexes for better performance