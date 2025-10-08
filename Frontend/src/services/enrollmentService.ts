import { api } from './api';

export const checkEnrollmentStatus = async (courseId: string, token: string): Promise<boolean> => {
  try {
    const response = await api.get(`/api/courses/${courseId}/enrollment-status`, token);
    return response.isEnrolled;
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    return false;
  }
};

export const getEnrolledCourses = async (token: string): Promise<any[]> => {
  try {
    const response = await api.get('/api/courses/enrolled', token);
    return response;
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
};
