import { User, Course, AuthResponse, ApiError, CourseFormData, LoginCredentials, ProfileUpdateData, ProfilePictureResponse } from '../types';
import type { FormData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
};

// Auth API calls
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return handleResponse<AuthResponse>(response);
};

export const register = async (userData: FormData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse<AuthResponse>(response);
};

// Course API calls
export const getCourses = async (): Promise<Course[]> => {
  const response = await fetch(`${API_URL}/api/courses`);
  return handleResponse<Course[]>(response);
};

export const getCourseById = async (id: string): Promise<Course> => {
  const response = await fetch(`${API_URL}/api/courses/${id}`);
  return handleResponse<Course>(response);
};

export const createCourse = async (courseData: CourseFormData, token: string): Promise<Course> => {
  const response = await fetch(`${API_URL}/api/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(courseData),
  });
  return handleResponse<Course>(response);
};

export const enrollInCourse = async (courseId: string, userId: string, token: string, paymentDetails: {
  transactionId: string;
  cardNumber: string;
  cardholderName: string;
  amount: number;
  date: string;
}): Promise<{ course: Course; enrollment: any }> => {
  const response = await fetch(`${API_URL}/api/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      userId,
      paymentDetails: {
        paymentId: paymentDetails.transactionId,
        paymentMethod: 'card',
        transactionId: paymentDetails.transactionId,
        cardNumber: paymentDetails.cardNumber,
        cardholderName: paymentDetails.cardholderName,
        amount: paymentDetails.amount
      }
    }),
  });
  return handleResponse<{ course: Course; enrollment: any }>(response);
};

// User API calls
export const getUserCourses = async (userId: string, token: string): Promise<Course[]> => {
  const response = await fetch(`${API_URL}/api/users/${userId}/courses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse<Course[]>(response);
};

export const updateProfile = async (token: string, data: ProfileUpdateData): Promise<User> => {
  const response = await fetch(`${API_URL}/api/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<User>(response);
};

export const uploadProfilePicture = async (token: string, file: File): Promise<ProfilePictureResponse> => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const response = await fetch(`${API_URL}/api/users/profile/picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload profile picture');
  }
  
  const data = await response.json();
  return data;
}; 