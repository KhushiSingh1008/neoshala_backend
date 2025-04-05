export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'instructor';
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  instructor: {
    _id: string;
    username: string;
  };
  students?: string[];
  rating?: number;
  reviews?: Review[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface FormData {
  username: string;
  email: string;
  password: string;
  role: 'student' | 'instructor';
}

export interface CourseFormData {
  title: string;
  description: string;
  price: string;
  category: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
} 