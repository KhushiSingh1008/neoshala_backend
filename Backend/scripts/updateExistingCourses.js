// Script to update existing courses to pending status
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import Course model
import Course from '../models/Course.js';

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neoshala';

async function updateExistingCourses() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all courses that don't have an approvalStatus
    const courses = await Course.find({ 
      approvalStatus: { $exists: false }
    });

    console.log(`Found ${courses.length} courses to update`);

    // Define batch size for updates
    const batchSize = 50;
    let updatedCount = 0;
    
    // Process courses in batches to avoid overwhelming the database
    for (let i = 0; i < courses.length; i += batchSize) {
      const batch = courses.slice(i, i + batchSize);
      
      // Update each course in the batch
      const promises = batch.map(course => {
        return Course.updateOne(
          { _id: course._id },
          { 
            $set: { 
              approvalStatus: 'approved', // Mark existing courses as approved
              published: true,
              approvedAt: new Date()
            } 
          }
        );
      });
      
      // Wait for the batch to complete
      const results = await Promise.all(promises);
      
      // Count updated courses
      const batchUpdatedCount = results.reduce((acc, result) => acc + result.modifiedCount, 0);
      updatedCount += batchUpdatedCount;
      
      console.log(`Updated ${updatedCount}/${courses.length} courses...`);
    }

    console.log(`Successfully updated ${updatedCount} courses to 'approved' status`);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error updating courses:', error);
    mongoose.disconnect();
  }
}

// Run the script
updateExistingCourses(); 