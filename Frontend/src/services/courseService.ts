import { Course } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Get all courses (public endpoint)
export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const response = await fetch(`${API_URL}/api/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<Course[]>(response);
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Get courses for a specific student (requires authentication)
export const getStudentCourses = async (userId: string, token: string): Promise<Course[]> => {
  try {
    const response = await fetch(`${API_URL}/api/courses/student/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse<Course[]>(response);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    throw error;
  }
};

// Get courses for a specific instructor
export const getInstructorCourses = async (instructorId: string): Promise<Course[]> => {
  try {
    const response = await fetch(`${API_URL}/api/courses/instructor/${instructorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<Course[]>(response);
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    throw error;
  }
};

// Get course by ID
export const getCourseById = async (courseId: string): Promise<Course> => {
  try {
    const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<Course>(response);
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

// Rate a course
export const rateCourse = async (
  courseId: string, 
  userId: string, 
  rating: number, 
  token: string
): Promise<Course> => {
  try {
    const response = await fetch(`${API_URL}/api/courses/${courseId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, userId }),
    });
    return handleResponse<Course>(response);
  } catch (error) {
    console.error('Error rating course:', error);
    throw error;
  }
};

// Get user's rating for a course
export const getUserRating = async (courseId: string, userId: string): Promise<{ rating: number }> => {
  try {
    const response = await fetch(`${API_URL}/api/courses/${courseId}/rating/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<{ rating: number }>(response);
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return { rating: 0 };
  }
};