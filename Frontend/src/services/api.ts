import { User, Course, AuthResponse, ApiError, CourseFormData, LoginCredentials, ProfileUpdateData, ProfilePictureResponse } from '../types';
import type { FormData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData: ApiError = await response.json();
    
    // Format error message
    let errorMessage = errorData.message || 'An error occurred';
    
    // Handle validation errors with multiple fields
    if (errorData.errors) {
      errorMessage = Object.entries(errorData.errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(', ');
    }
    
    const error = new Error(errorMessage);
    // @ts-ignore - Add the full error data to the error object
    error.data = errorData;
    throw error;
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
  try {
    // Ensure price is a number
    const processedData = {
      ...courseData,
      price: typeof courseData.price === 'string' ? parseFloat(courseData.price) : courseData.price
    };
    
    // Filter out empty syllabus and requirements
    if (Array.isArray(processedData.syllabus)) {
      processedData.syllabus = processedData.syllabus.filter(item => item.trim() !== '');
    }
    
    if (Array.isArray(processedData.requirements)) {
      processedData.requirements = processedData.requirements.filter(item => item.trim() !== '');
    }
    
    console.log('Creating course with data:', processedData);
    
    const response = await fetch(`${API_URL}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(processedData),
    });
    
    return handleResponse<Course>(response);
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const enrollInCourse = async (
  courseId: string, 
  token: string, 
  paymentDetails: {
    transactionId: string;
    cardNumber: string;
    cardholderName: string;
    amount: number;
    paymentMethod?: string;
    date?: string;
  }
): Promise<{ course: Course; enrollment: any; message: string }> => {
  const response = await fetch(`${API_URL}/api/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      paymentDetails: {
        paymentId: paymentDetails.transactionId,
        paymentMethod: paymentDetails.paymentMethod || 'card',
        transactionId: paymentDetails.transactionId,
        cardNumber: paymentDetails.cardNumber,
        cardholderName: paymentDetails.cardholderName,
        amount: paymentDetails.amount
      }
    }),
  });
  
  return handleResponse<{ course: Course; enrollment: any; message: string }>(response);
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

export const updateEmailNotifications = async (token: string, enabled: boolean): Promise<{ message: string; emailNotifications: boolean }> => {
  console.log('Calling API to update email notifications:', enabled);
  
  const response = await fetch(`${API_URL}/api/users/notifications/email`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ enabled }),
  });
  
  const result = await handleResponse<{ message: string; emailNotifications: boolean }>(response);
  console.log('API response for email notifications update:', result);
  
  return result;
}; 