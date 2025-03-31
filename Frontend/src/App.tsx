import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CheckoutU from './pages/CheckoutU';
import Explore from './pages/Explore';
import FavouritesU from './pages/FavouritesU';
import Login from './pages/Login';
import MyCoursesU from './pages/MyCoursesU';
import Profile from './pages/Profile';
import AddedCoursesT from './pages/AddedCoursesT';
import Navbar from './components/Navbar';
import './App.css';

const App = () => {
  // Add a simple state to test login status (for testing purposes)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <Router>
      <div className="app-container">
        {/* Add inline style for debugging */}
        <div>
          <Navbar isLoggedIn={isLoggedIn} />
        </div>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<CheckoutU />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/favourites" element={<FavouritesU />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-courses" element={<MyCoursesU />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/added-courses" element={<AddedCoursesT />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;