import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CheckoutPage from './pages/CheckoutPage';
import ExplorePage from './pages/ExplorePage';
import FavouritesU from './pages/FavouritesU';
import AuthPage from './pages/AuthPage';
import MyCoursesU from './pages/MyCoursesU';
import ProfilePage from './pages/ProfilePage';
import AddedCoursesT from './pages/AddedCoursesT';
import CourseDetailPage from './pages/CourseDetailPage';
import CartPage from './pages/CartPage';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminPendingCourses from './pages/AdminPendingCourses';
import AdminCourses from './pages/AdminCourses';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  useEffect(() => {
    console.log('🚀 Neoshala App Starting...');
    console.log('📡 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000');
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <div className="app-container">
                <Navbar />
                <main>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/course/:courseId" element={<CourseDetailPage />} />
                  <Route path="/AuthPage" element={<AuthPage />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Protected Routes - Student Access */}
                  <Route path="/cart" element={
                    <ProtectedRoute requiredRole="student">
                      <CartPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={
                    <ProtectedRoute requiredRole="student">
                      <CheckoutPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/favourites" element={
                    <ProtectedRoute requiredRole="student">
                      <FavouritesU />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-courses" element={
                    <ProtectedRoute requiredRole="student">
                      <MyCoursesU />
                    </ProtectedRoute>
                  } />

                  {/* Protected Routes - Instructor Access */}
                  <Route path="/added-courses" element={
                    <ProtectedRoute requiredRole="instructor">
                      <AddedCoursesT />
                    </ProtectedRoute>
                  } />

                  {/* Protected Routes - Admin Access */}
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/pending-courses" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPendingCourses />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/courses" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminCourses />
                    </ProtectedRoute>
                  } />

                  {/* Protected Route - Any Authenticated User */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />

                  {/* Fallback route for undefined paths */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              </div>
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;