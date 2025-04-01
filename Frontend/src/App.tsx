import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CheckoutU from './pages/CheckoutU';
import ExplorePage from './pages/ExplorePage';
import FavouritesU from './pages/FavouritesU';
import AuthPage from './pages/AuthPage';
import MyCoursesU from './pages/MyCoursesU';
import ProfilePage from './pages/ProfilePage';
import AddedCoursesT from './pages/AddedCoursesT';
import CourseDetailPage from './pages/CourseDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/course/:courseId" element={<CourseDetailPage />} />
              <Route path="/AuthPage" element={<AuthPage />} />

              {/* Protected Routes - Student Access */}
              <Route path="/checkout" element={
                <ProtectedRoute requiredRole="student">
                  <CheckoutU />
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
      </AuthProvider>
    </Router>
  );
};

export default App;