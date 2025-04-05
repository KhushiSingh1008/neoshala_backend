import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { enrollInCourse } from '../services/api';
import { toast } from 'react-toastify';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    transactionId: '',
    amount: 0,
    date: '',
    courses: [] as typeof cartItems
  });

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction ID
      const transactionId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const currentDate = new Date().toLocaleString();
      
      // Enroll student in all courses
      const enrollmentPromises = cartItems.map(course => 
        enrollInCourse(course._id, user!._id, token!)
      );
      
      await Promise.all(enrollmentPromises);
      
      // Set payment details
      setPaymentDetails({
        transactionId,
        amount: total,
        date: currentDate,
        courses: [...cartItems]
      });
      
      // Show success state
      setPaymentSuccess(true);
      
      // Clear cart after successful payment
      clearCart();
    } catch (error) {
      console.error('Payment or enrollment failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/my-courses');
  };

  if (cartItems.length === 0 && !paymentSuccess) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some courses to your cart before proceeding to checkout.</p>
        <button onClick={() => navigate('/explore')} className="browse-courses-btn">
          Browse Courses
        </button>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="payment-success">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <div className="payment-details">
            <div className="detail-row">
              <span>Transaction ID:</span>
              <span>{paymentDetails.transactionId}</span>
            </div>
            <div className="detail-row">
              <span>Amount Paid:</span>
              <span>₹{paymentDetails.amount}</span>
            </div>
            <div className="detail-row">
              <span>Date:</span>
              <span>{paymentDetails.date}</span>
            </div>
          </div>
          <div className="purchased-courses">
            <h3>Purchased Courses:</h3>
            {paymentDetails.courses.map(course => (
              <div key={course._id} className="course-item">
                <span>{course.title}</span>
                <span>₹{course.price}</span>
              </div>
            ))}
          </div>
          <button onClick={handleContinue} className="continue-btn">
            Go to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-container">
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cartItems.map(course => (
              <div key={course._id} className="summary-item">
                <div className="item-details">
                  <h3>{course.title}</h3>
                  <p>By {course.instructor?.username}</p>
                </div>
                <p className="item-price">₹{course.price}</p>
              </div>
            ))}
          </div>
          <div className="total-section">
            <span>Total Amount:</span>
            <span className="total-price">₹{total}</span>
          </div>
        </div>

        <div className="payment-section">
          <h2>Payment Details</h2>
          <form onSubmit={handlePayment} className="payment-form">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                pattern="[0-9\s]{16,19}"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  pattern="(0[1-9]|1[0-2])\/([0-9]{2})"
                  required
                />
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  pattern="[0-9]{3,4}"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                required
              />
            </div>

            <button type="submit" className="pay-button" disabled={loading}>
              {loading ? 'Processing...' : `Pay ₹${total}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 