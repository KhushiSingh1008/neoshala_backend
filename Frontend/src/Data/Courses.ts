import { Course } from '../Types/Course';
import react from '../assets/CourseImage/react.png';
import stress from '../assets/CourseImage/stress.png';
import ts from '../assets/CourseImage/ts.png';
import yoga from '../assets/CourseImage/yoga.png';
import caligraphy from '../assets/CourseImage/caligraphy.png';
import healthycook from '../assets/CourseImage/healthycook.png';
import meditaiotn from '../assets/CourseImage/meditaiotn.png';
import posPar from '../assets/CourseImage/posPar.png';
import pottery from '../assets/CourseImage/pottery.png';
import pubspeak from '../assets/CourseImage/pubspeak.png';


export const courses: Course[] = [
  {
    id: '1',
    title: 'React Fundamentals',
    instructor: 'Jane Smith',
    description: 'Learn the basics of React and build your first application',
    duration: '6 weeks',
    level: 'Beginner',
    imageUrl: react,
    price: 49.99,
    rating: 4.7,
    category: 'Web Development',
    detailedDescription: 'This course will teach you everything you need to know to start building applications with React. We cover components, state, props, hooks, and more.',
    syllabus: [
      'Introduction to React',
      'Components and Props',
      'State and Lifecycle',
      'Hooks',
      'Building a Complete App'
    ],
    requirements: [
      'Basic JavaScript knowledge',
      'HTML/CSS fundamentals'
    ]
  },
  {
    id: '2',
    title: 'Advanced TypeScript',
    instructor: 'John Doe',
    description: 'Master advanced TypeScript concepts for large-scale applications',
    duration: '8 weeks',
    level: 'Advanced',
    imageUrl: ts,
    price: 59.99,
    rating: 4.9,
    category: 'Web Development',
    detailedDescription: 'Take your TypeScript skills to the next level with advanced type system features, decorators, and patterns for large applications.',
    syllabus: [
      'Advanced Types',
      'Decorators',
      'Namespaces and Modules',
      'Type System Deep Dive',
      'Performance Optimization'
    ],
    requirements: [
      'Intermediate TypeScript knowledge',
      'Experience with JavaScript'
    ]
  },
  {
    "id": "3",
    "title": "Yoga for Beginners",
    "instructor": "Emily Green",
    "description": "A gentle introduction to yoga for relaxation and flexibility.",
    "duration": "4 weeks",
    "level": "Beginner",
    "imageUrl": yoga,
    "price": 39.99,
    "rating": 4.8,
    "category": "Health & Wellness",
    "detailedDescription": "This course guides you through basic yoga postures, breathing exercises, and mindfulness techniques to help you improve flexibility, strength, and inner calm.",
    "syllabus": [
      "Introduction to Yoga",
      "Basic Yoga Poses",
      "Breathing Techniques",
      "Mindfulness & Meditation",
      "Creating a Daily Routine"
    ],
    "requirements": [
      "Comfortable clothing",
      "Yoga mat (optional)"
    ]
  },
  {
    "id": "4",
    "title": "Positive Parenting Strategies",
    "instructor": "Sarah Johnson",
    "description": "Learn effective parenting techniques to nurture confident and happy children.",
    "duration": "6 weeks",
    "level": "Intermediate",
    "imageUrl": posPar,
    "price": 49.99,
    "rating": 4.7,
    "category": "Parenting",
    "detailedDescription": "Discover practical strategies for positive discipline, communication, and fostering strong parent-child relationships.",
    "syllabus": [
      "Understanding Child Behavior",
      "Effective Communication",
      "Positive Discipline Techniques",
      "Building Emotional Resilience",
      "Creating a Loving Home Environment"
    ],
    "requirements": [
      "Open mindset",
      "Willingness to implement new techniques"
    ]
  },
  {
    "id": "5",
    "title": "Pottery for Beginners",
    "instructor": "Michael Clay",
    "description": "Discover the joy of shaping clay into beautiful pottery.",
    "duration": "5 weeks",
    "level": "Beginner",
    "imageUrl": pottery,
    "price": 44.99,
    "rating": 4.6,
    "category": "Arts & Crafts",
    "detailedDescription": "This course introduces you to hand-building and wheel techniques to create unique ceramic pieces.",
    "syllabus": [
      "Introduction to Clay",
      "Basic Hand-Building Techniques",
      "Wheel Throwing Fundamentals",
      "Glazing and Firing",
      "Creating Your First Pottery Piece"
    ],
    "requirements": [
      "Access to clay and basic tools",
      "Creative enthusiasm"
    ]
  },
  {
    "id": "6",
    "title": "Stress Management and Mindfulness",
    "instructor": "David White",
    "description": "Learn how to reduce stress and cultivate mindfulness in daily life.",
    "duration": "4 weeks",
    "level": "Beginner",
    "imageUrl": stress,
    "price": 39.99,
    "rating": 4.9,
    "category": "Personal Development",
    "detailedDescription": "This course explores relaxation techniques, mindfulness practices, and coping mechanisms to handle stress effectively.",
    "syllabus": [
      "Understanding Stress",
      "Mindfulness Meditation",
      "Breathing Exercises",
      "Time Management Strategies",
      "Building Long-Term Resilience"
    ],
    "requirements": [
      "Willingness to practice mindfulness",
      "Open mindset"
    ]
  },
  {
    "id": "7",
    "title": "The Art of Calligraphy",
    "instructor": "Sophia Brown",
    "description": "Master the beautiful art of modern calligraphy and lettering.",
    "duration": "6 weeks",
    "level": "Beginner",
    "imageUrl": caligraphy,
    "price": 42.99,
    "rating": 4.8,
    "category": "Arts & Crafts",
    "detailedDescription": "Learn various calligraphy styles, from brush lettering to traditional scripts, and create stunning works of art.",
    "syllabus": [
      "Introduction to Calligraphy",
      "Basic Strokes and Letter Forms",
      "Modern vs. Traditional Styles",
      "Creating Your Own Designs",
      "Final Calligraphy Project"
    ],
    "requirements": [
      "Calligraphy pen or brush",
      "Practice sheets"
    ]
  },
  {
    "id": "8",
    "title": "Meditation for Inner Peace",
    "instructor": "Dr. Alan Reed",
    "description": "A step-by-step guide to developing a peaceful meditation practice.",
    "duration": "5 weeks",
    "level": "Beginner",
    "imageUrl": meditaiotn,
    "price": 34.99,
    "rating": 4.9,
    "category": "Health & Wellness",
    "detailedDescription": "Learn how to use meditation techniques to cultivate relaxation, reduce anxiety, and enhance focus.",
    "syllabus": [
      "Introduction to Meditation",
      "Guided Breathing Exercises",
      "Mindfulness and Awareness",
      "Overcoming Mental Distractions",
      "Building a Daily Practice"
    ],
    "requirements": [
      "Quiet space for practice",
      "Open-mindedness"
    ]
  },
  {
    "id": "9",
    "title": "Public Speaking Mastery",
    "instructor": "Chris Evans",
    "description": "Develop confidence and master the art of public speaking.",
    "duration": "6 weeks",
    "level": "Intermediate",
    "imageUrl": pubspeak,
    "price": 49.99,
    "rating": 4.7,
    "category": "Personal Development",
    "detailedDescription": "Enhance your communication skills with proven techniques to speak with confidence and impact.",
    "syllabus": [
      "Overcoming Stage Fright",
      "Effective Speech Structure",
      "Body Language and Voice Control",
      "Engaging Your Audience",
      "Handling Q&A with Confidence"
    ],
    "requirements": [
      "Willingness to practice speaking",
      "Basic communication skills"
    ]
  },
  {
    "id": "10",
    "title": "Healthy Cooking Made Easy",
    "instructor": "Laura James",
    "description": "Learn how to prepare nutritious and delicious meals at home.",
    "duration": "5 weeks",
    "level": "Beginner",
    "imageUrl": healthycook,
    "price": 44.99,
    "rating": 4.8,
    "category": "Food & Nutrition",
    "detailedDescription": "Discover easy-to-make, healthy recipes and cooking techniques that fit your lifestyle.",
    "syllabus": [
      "Introduction to Healthy Eating",
      "Essential Cooking Skills",
      "Meal Planning on a Budget",
      "Plant-Based and Protein-Rich Meals",
      "Healthy Desserts and Snacks"
    ],
    "requirements": [
      "Basic kitchen equipment",
      "Interest in healthy eating"
    ]
  }
  // Add more courses as needed
];