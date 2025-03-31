export interface Course {
    id: string;
    title: string;
    instructor: string;
    description: string;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    imageUrl: string;
    price: number;
    rating: number;
    category: string;
    detailedDescription: string;
    syllabus?: string[];
    requirements?: string[];
  }