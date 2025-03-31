import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CheckoutU from './pages/CheckoutU';
import ExplorePage from './pages/ExplorePage'; // Updated import
import FavouritesU from './pages/FavouritesU';
import Login from './pages/Login';
import MyCoursesU from './pages/MyCoursesU';
import Profile from './pages/Profile';
import AddedCoursesT from './pages/AddedCoursesT';
import CourseDetailPage from './pages/CourseDetailPage'; // Updated import
import './App.css'; // Make sure you have this

const App = () => {
  const [isLoggedIn] = React.useState(false);

  return (
    <Router>
      <div className="app-container">
        <Navbar isLoggedIn={isLoggedIn} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<CheckoutU />} />
            <Route path="/explore" element={<ExplorePage />} /> {/* Updated component */}
            <Route path="/favourites" element={<FavouritesU />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-courses" element={<MyCoursesU />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/added-courses" element={<AddedCoursesT />} />
            <Route path="/course/:courseId" element={<CourseDetailPage />} /> {/* Updated component and param name */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;