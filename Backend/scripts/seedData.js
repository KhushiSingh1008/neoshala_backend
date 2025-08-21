import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neoshala';

const sampleCourses = [
  {
    title: "Introduction to React",
    instructor: null, // Will be set to a user ID
    location: "Online",
    description: "Learn the basics of React.js and build modern web applications",
    duration: "8 weeks",
    level: "Beginner",
    imageUrl: "https://via.placeholder.com/300x200?text=React+Course",
    price: 2999,
    category: "Web Development",
    detailedDescription: "This comprehensive course covers React fundamentals, components, state management, and modern React patterns. Perfect for beginners looking to start their React journey.",
    syllabus: [
      "Introduction to React and JSX",
      "Components and Props",
      "State and Event Handling",
      "React Hooks",
      "Context API",
      "Building a Complete Project"
    ],
    requirements: [
      "Basic knowledge of HTML, CSS, and JavaScript",
      "A computer with internet connection",
      "Code editor (VS Code recommended)"
    ],
    published: true,
    approvalStatus: "approved"
  },
  {
    title: "Advanced Node.js Development",
    instructor: null,
    location: "Mumbai",
    description: "Master backend development with Node.js, Express, and MongoDB",
    duration: "12 weeks",
    level: "Advanced",
    imageUrl: "https://via.placeholder.com/300x200?text=Node.js+Course",
    price: 4999,
    category: "Backend Development",
    detailedDescription: "Deep dive into Node.js ecosystem, learn to build scalable APIs, work with databases, implement authentication, and deploy applications.",
    syllabus: [
      "Advanced Node.js Concepts",
      "Express.js Framework",
      "Database Integration",
      "Authentication & Authorization",
      "API Design & Security",
      "Testing & Deployment"
    ],
    requirements: [
      "Solid understanding of JavaScript",
      "Basic knowledge of Node.js",
      "Familiarity with databases"
    ],
    published: true,
    approvalStatus: "approved"
  },
  {
    title: "Python for Data Science",
    instructor: null,
    location: "Bangalore",
    description: "Learn Python programming for data analysis and machine learning",
    duration: "10 weeks",
    level: "Intermediate",
    imageUrl: "https://via.placeholder.com/300x200?text=Python+Data+Science",
    price: 3999,
    category: "Data Science",
    detailedDescription: "Comprehensive course covering Python fundamentals, data manipulation with pandas, visualization with matplotlib, and introduction to machine learning.",
    syllabus: [
      "Python Fundamentals",
      "NumPy and Pandas",
      "Data Visualization",
      "Statistical Analysis",
      "Machine Learning Basics",
      "Real-world Projects"
    ],
    requirements: [
      "Basic programming knowledge",
      "High school mathematics",
      "Curiosity about data"
    ],
    published: true,
    approvalStatus: "approved"
  },
  {
    title: "UI/UX Design Fundamentals",
    instructor: null,
    location: "Delhi",
    description: "Master the principles of user interface and user experience design",
    duration: "6 weeks",
    level: "Beginner",
    imageUrl: "https://via.placeholder.com/300x200?text=UI%2FUX+Design",
    price: 2499,
    category: "Design",
    detailedDescription: "Learn design thinking, user research, wireframing, prototyping, and create stunning user interfaces that provide excellent user experiences.",
    syllabus: [
      "Design Thinking Process",
      "User Research Methods",
      "Wireframing and Prototyping",
      "Visual Design Principles",
      "Usability Testing",
      "Design Tools (Figma, Adobe XD)"
    ],
    requirements: [
      "No prior design experience needed",
      "Creative mindset",
      "Computer with design software"
    ],
    published: true,
    approvalStatus: "approved"
  },
  {
    title: "Digital Marketing Mastery",
    instructor: null,
    location: "Online",
    description: "Complete guide to digital marketing strategies and tools",
    duration: "8 weeks",
    level: "Intermediate",
    imageUrl: "https://via.placeholder.com/300x200?text=Digital+Marketing",
    price: 3499,
    category: "Marketing",
    detailedDescription: "Learn SEO, social media marketing, content marketing, email marketing, and analytics to grow your business online.",
    syllabus: [
      "Digital Marketing Fundamentals",
      "Search Engine Optimization",
      "Social Media Marketing",
      "Content Marketing Strategy",
      "Email Marketing",
      "Analytics and Reporting"
    ],
    requirements: [
      "Basic computer skills",
      "Understanding of social media",
      "Business mindset"
    ],
    published: true,
    approvalStatus: "approved"
  }
];

const sampleUsers = [
  {
    username: "John Instructor",
    email: "john.instructor@example.com",
    password: "$2b$10$example.hash.here", // This would be a real hash in production
    role: "instructor",
    bio: "Experienced web developer with 5+ years in React and Node.js",
    location: "Mumbai",
    emailNotifications: true
  },
  {
    username: "Sarah Teacher",
    email: "sarah.teacher@example.com", 
    password: "$2b$10$example.hash.here",
    role: "instructor",
    bio: "Data scientist and Python expert, passionate about teaching",
    location: "Bangalore",
    emailNotifications: true
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing courses...');
    await Course.deleteMany({});
    
    // Create sample users first (if they don't exist)
    console.log('Creating sample instructors...');
    const instructors = [];
    
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        instructors.push(user);
        console.log(`Created instructor: ${user.username}`);
      } else {
        instructors.push(existingUser);
        console.log(`Using existing instructor: ${existingUser.username}`);
      }
    }

    // Assign instructors to courses
    console.log('Creating sample courses...');
    for (let i = 0; i < sampleCourses.length; i++) {
      const courseData = {
        ...sampleCourses[i],
        instructor: instructors[i % instructors.length]._id
      };
      
      const course = new Course(courseData);
      await course.save();
      console.log(`Created course: ${course.title}`);
    }

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${sampleCourses.length} courses`);
    console.log(`Created/verified ${instructors.length} instructors`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();