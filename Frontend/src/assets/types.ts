// src/types.ts
export interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Module {
  id: number;
  title: string;
  duration: string;
  description: string;
  expanded?: boolean;
}

export interface Trainer {
  name: string;
  credentials: string;
  bio: string;
  coursesCount: number;
  avatar: string;
}

export interface Course {
  id: number;
  title: string;
  trainer: Trainer;
  rating: number;
  reviewsCount: number;
  studentsEnrolled: number;
  price: number;
  imageUrl: string; // Changed from thumbnail to match Explore
  description: string;
  highlights: string[];
  outcomes: string[];
  modules: Module[];
  reviews: Review[];
}