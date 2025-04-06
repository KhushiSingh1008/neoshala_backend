# NeoShala Course Management System

A platform for instructors to create courses and students to enroll in them.

## Features

- User authentication and authorization
- Instructor dashboard for course management
- Student dashboard for enrollment and course tracking
- Course creation, editing, and deletion
- Course enrollment and payment processing
- In-app notifications and email notifications
- Profile management

## Admin Functionality

The system now includes an admin role that can approve or reject courses:

1. **Admin Dashboard** - Provides an overview of all courses, users, and key statistics
2. **Course Approval System** - Courses created by instructors are set to "pending" by default and require admin approval
3. **Admin Role** - Special permissions for course moderation

### Setting up the Admin User

To create an admin user, run the following commands:

```bash
# Navigate to the Backend/scripts directory
cd Backend/scripts

# Install dependencies if needed
npm install

# Create the admin user
npm run create-admin
```

Default admin credentials:
- Username: admin
- Email: admin@neoshala.com
- Password: Admin@123

### Admin Features

1. **Course Approval** - Approve or reject courses submitted by instructors
2. **Dashboard** - View statistics about courses, users, and platform activity
3. **Access Control** - Only admin users can access the admin dashboard

## How Course Approval Works

1. Instructors create courses as usual
2. Courses are marked as "pending" and not visible to students
3. Admin reviews the course content from their dashboard
4. Admin approves or rejects the course
5. Approved courses become visible to students on the Explore page
6. Rejected courses include feedback for the instructor

## Setup Instructions

1. Clone the repository
2. Install dependencies for frontend and backend:
   ```
   cd Frontend && npm install
   cd ../Backend && npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` in the Backend folder
   - Configure your MongoDB connection string
   - Set up JWT secret
   - Configure email service (for notifications)

4. Run the application:
   ```
   # Start backend server
   cd Backend && npm run dev
   
   # Start frontend (in another terminal)
   cd Frontend && npm run dev
   ```

## Email Notifications Setup

To enable email notifications:

1. Set up the email configuration in the Backend `.env` file:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=your_email@gmail.com
   ```

2. For Gmail, you'll need to:
   - Enable 2-factor authentication
   - Generate an app password
   - Use the app password in the EMAIL_PASSWORD field

3. Users can toggle email notifications on/off in their profile settings.

## API Documentation

- POST /api/users/register - Register a new user
- POST /api/users/login - Login
- GET /api/courses - Get all courses
- POST /api/courses - Create a new course (instructor only)
- PUT /api/courses/:id - Update a course (instructor only)
- DELETE /api/courses/:id - Delete a course (instructor only)
- POST /api/courses/:id/enroll - Enroll in a course

### Upgrading from Previous Versions

If you are upgrading from a previous version that didn't have the course approval system, run the following script to update existing courses:

```bash
# Navigate to the Backend/scripts directory
cd Backend/scripts

# Install dependencies if needed
npm install

# Update existing courses to 'approved' status
npm run update-courses
```

This will mark all existing courses as 'approved' so they remain visible to users.