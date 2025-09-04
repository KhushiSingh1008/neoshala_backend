import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { Course } from '../types';
import * as courseApi from '../services/courseService';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

// State
interface CourseState {
  courses: Course[];
  instructorCourses: Course[];
  studentCourses: Course[];
  selectedCourse: Course | null;
  loading: boolean;
  error: string | null;
}

// Actions
 type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_INSTRUCTOR_COURSES'; payload: Course[] }
  | { type: 'SET_STUDENT_COURSES'; payload: Course[] }
  | { type: 'SET_SELECTED_COURSE'; payload: Course | null }
  | { type: 'UPSERT_INSTRUCTOR_COURSE'; payload: Course }
  | { type: 'REMOVE_INSTRUCTOR_COURSE'; payload: string };

const initialState: CourseState = {
  courses: [],
  instructorCourses: [],
  studentCourses: [],
  selectedCourse: null,
  loading: false,
  error: null,
};

function reducer(state: CourseState, action: Action): CourseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    case 'SET_INSTRUCTOR_COURSES':
      return { ...state, instructorCourses: action.payload };
    case 'SET_STUDENT_COURSES':
      return { ...state, studentCourses: action.payload };
    case 'SET_SELECTED_COURSE':
      return { ...state, selectedCourse: action.payload };
    case 'UPSERT_INSTRUCTOR_COURSE': {
      const exists = state.instructorCourses.some(c => c._id === action.payload._id);
      const instructorCourses = exists
        ? state.instructorCourses.map(c => (c._id === action.payload._id ? action.payload : c))
        : [action.payload, ...state.instructorCourses];
      return { ...state, instructorCourses };
    }
    case 'REMOVE_INSTRUCTOR_COURSE':
      return { ...state, instructorCourses: state.instructorCourses.filter(c => c._id !== action.payload) };
    default:
      return state;
  }
}

interface CourseContextValue extends CourseState {
  fetchAllCourses: () => Promise<void>;
  fetchCourseById: (courseId: string) => Promise<void>;
  fetchInstructorCourses: (instructorId: string) => Promise<void>;
  fetchStudentCourses: (studentId: string) => Promise<void>;
  createCourse: (data: any) => Promise<Course | null>;
  enrollInCourse: (courseId: string, payment: any) => Promise<void>;
  rateCourse: (courseId: string, rating: number) => Promise<void>;
  removeInstructorCourseFromState: (courseId: string) => void;
}

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { token, user } = useAuth();

  const setLoading = (val: boolean) => dispatch({ type: 'SET_LOADING', payload: val });
  const setError = (err: string | null) => dispatch({ type: 'SET_ERROR', payload: err });

  const fetchAllCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseApi.getAllCourses();
      dispatch({ type: 'SET_COURSES', payload: data });
    } catch (e: any) {
      setError(e?.message || 'Failed to load courses');
      toast.error(e?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourseById = useCallback(async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseApi.getCourseById(courseId);
      dispatch({ type: 'SET_SELECTED_COURSE', payload: data });
    } catch (e: any) {
      setError(e?.message || 'Failed to load course');
      toast.error(e?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInstructorCourses = useCallback(async (instructorId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseApi.getInstructorCourses(instructorId);
      dispatch({ type: 'SET_INSTRUCTOR_COURSES', payload: data });
    } catch (e: any) {
      setError(e?.message || 'Failed to load instructor courses');
      toast.error(e?.message || 'Failed to load instructor courses');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentCourses = useCallback(async (studentId: string) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await courseApi.getStudentCourses(studentId, token);
      dispatch({ type: 'SET_STUDENT_COURSES', payload: data });
    } catch (e: any) {
      setError(e?.message || 'Failed to load your courses');
      toast.error(e?.message || 'Failed to load your courses');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createCourse = useCallback(async (data: any) => {
    if (!token || !user?._id) {
      toast.error('Not authenticated');
      return null;
    }
    try {
      setLoading(true);
      setError(null);
      const payload = { ...data, instructor: user._id };
      const course = await api.createCourse(payload, token);
      dispatch({ type: 'UPSERT_INSTRUCTOR_COURSE', payload: course });
      toast.success('Course created successfully');
      return course;
    } catch (e: any) {
      setError(e?.message || 'Failed to create course');
      toast.error(e?.message || 'Failed to create course');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  const enrollInCourse = useCallback(async (courseId: string, payment: any) => {
    if (!token) {
      toast.error('Not authenticated');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await api.enrollInCourse(courseId, token, payment);
      toast.success('Enrollment successful');
      // Optionally refresh student courses
      if (user?._id) {
        fetchStudentCourses(user._id);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to enroll');
      toast.error(e?.message || 'Failed to enroll');
    } finally {
      setLoading(false);
    }
  }, [token, user?._id, fetchStudentCourses]);

  const rateCourse = useCallback(async (courseId: string, rating: number) => {
    if (!token || !user?._id) return;
    try {
      setLoading(true);
      setError(null);
      await courseApi.rateCourse(courseId, user._id, rating, token);
      toast.success('Rating submitted');
      // Refresh selected course
      await fetchCourseById(courseId);
    } catch (e: any) {
      setError(e?.message || 'Failed to rate course');
      toast.error(e?.message || 'Failed to rate course');
    } finally {
      setLoading(false);
    }
  }, [token, user?._id, fetchCourseById]);

  const removeInstructorCourseFromState = useCallback((courseId: string) => {
    dispatch({ type: 'REMOVE_INSTRUCTOR_COURSE', payload: courseId });
  }, []);

  const value: CourseContextValue = useMemo(() => ({
    ...state,
    fetchAllCourses,
    fetchCourseById,
    fetchInstructorCourses,
    fetchStudentCourses,
    createCourse,
    enrollInCourse,
    rateCourse,
    removeInstructorCourseFromState,
  }), [state, fetchAllCourses, fetchCourseById, fetchInstructorCourses, fetchStudentCourses, createCourse, enrollInCourse, rateCourse, removeInstructorCourseFromState]);

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within a CourseProvider');
  return ctx;
};
