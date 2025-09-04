import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { Course } from '../types';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AdminState {
  pendingCourses: Course[];
  allCourses: Course[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PENDING_COURSES'; payload: Course[] }
  | { type: 'SET_ALL_COURSES'; payload: Course[] }
  | { type: 'REMOVE_PENDING'; payload: string }
  | { type: 'UPSERT_COURSE'; payload: Course };

const initialState: AdminState = {
  pendingCourses: [],
  allCourses: [],
  loading: false,
  error: null,
};

function reducer(state: AdminState, action: Action): AdminState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PENDING_COURSES':
      return { ...state, pendingCourses: action.payload };
    case 'SET_ALL_COURSES':
      return { ...state, allCourses: action.payload };
    case 'REMOVE_PENDING':
      return { ...state, pendingCourses: state.pendingCourses.filter(c => c._id !== action.payload) };
    case 'UPSERT_COURSE': {
      const exists = state.allCourses.some(c => c._id === action.payload._id);
      const allCourses = exists
        ? state.allCourses.map(c => (c._id === action.payload._id ? action.payload : c))
        : [action.payload, ...state.allCourses];
      return { ...state, allCourses };
    }
    default:
      return state;
  }
}

interface AdminContextValue extends AdminState {
  fetchPendingCourses: () => Promise<void>;
  fetchAllCourses: (status?: string) => Promise<void>;
  approveCourse: (id: string) => Promise<void>;
  rejectCourse: (id: string, reason: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { token } = useAuth();

  const setLoading = (v: boolean) => dispatch({ type: 'SET_LOADING', payload: v });
  const setError = (e: string | null) => dispatch({ type: 'SET_ERROR', payload: e });

  const fetchPendingCourses = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/admin/courses/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch pending courses');
      const data = await res.json();
      dispatch({ type: 'SET_PENDING_COURSES', payload: data });
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch pending courses');
      toast.error(e?.message || 'Failed to fetch pending courses');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchAllCourses = useCallback(async (status?: string) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const url = new URL(`${API_URL}/api/admin/courses`);
      if (status) url.searchParams.set('status', status);
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      dispatch({ type: 'SET_ALL_COURSES', payload: data });
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch courses');
      toast.error(e?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const approveCourse = useCallback(async (id: string) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/admin/courses/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to approve course');
      const data = await res.json();
      dispatch({ type: 'UPSERT_COURSE', payload: data.course });
      dispatch({ type: 'REMOVE_PENDING', payload: id });
      toast.success(data.message || 'Course approved');
    } catch (e: any) {
      setError(e?.message || 'Failed to approve course');
      toast.error(e?.message || 'Failed to approve course');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const rejectCourse = useCallback(async (id: string, reason: string) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/admin/courses/${id}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: reason }),
      });
      if (!res.ok) throw new Error('Failed to reject course');
      const data = await res.json();
      dispatch({ type: 'REMOVE_PENDING', payload: id });
      toast.success(data.message || 'Course rejected');
    } catch (e: any) {
      setError(e?.message || 'Failed to reject course');
      toast.error(e?.message || 'Failed to reject course');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const value = useMemo(() => ({
    ...state,
    fetchPendingCourses,
    fetchAllCourses,
    approveCourse,
    rejectCourse,
  }), [state, fetchPendingCourses, fetchAllCourses, approveCourse, rejectCourse]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
};
