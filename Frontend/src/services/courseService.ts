import { Course, ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
};

export const fetchInstructorCourses = async (token: string): Promise<Course[]> => {
  const response = await fetch(`${API_URL}/api/courses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse<Course[]>(response);
}; 