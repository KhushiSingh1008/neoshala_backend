// Script to create an admin user in the database
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import User model
import User from '../models/User.js';

// Admin user data
const adminUser = {
  username: 'admin',
  email: 'admin@neoshala.com',
  password: 'Admin@123',
  role: 'admin',
  isVerified: true,
  emailNotifications: true,
  bio: 'System Administrator'
};

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neoshala';

async function createAdminUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: adminUser.email },
        { username: adminUser.username }
      ]
    });

    if (existingUser) {
      console.log('Admin user already exists!');
      mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);

    // Create admin user
    const user = new User({
      ...adminUser,
      password: hashedPassword,
      createdAt: new Date()
    });

    await user.save();
    console.log('Admin user created successfully!');
    console.log(`Username: ${adminUser.username}`);
    console.log(`Password: ${adminUser.password}`);
    console.log(`Email: ${adminUser.email}`);

    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.disconnect();
  }
}

// Run the script
createAdminUser(); 