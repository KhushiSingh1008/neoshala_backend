import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { enrollInCourse } from '../services/api';
import { sendCoursePurchaseNotification } from '../services/notificationService';
import { toast } from 'react-toastify';
import { Course } from '../types';
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
      // Get form data
      const form = e.target as HTMLFormElement;
      const cardNumber = (form.querySelector('input[placeholder="1234 5678 9012 3456"]') as HTMLInputElement).value;
      const expiryDate = (form.querySelector('input[placeholder="MM/YY"]') as HTMLInputElement).value;
      const cvv = (form.querySelector('input[placeholder="123"]') as HTMLInputElement).value;
      const cardholderName = (form.querySelector('input[placeholder="John Doe"]') as HTMLInputElement).value;

      // Basic card validation
      if (!cardNumber.replace(/\s/g, '').match(/^[0-9]{16}$/)) {
        throw new Error('Invalid card number');
      }
      if (!expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
        throw new Error('Invalid expiry date');
      }
      if (!cvv.match(/^[0-9]{3,4}$/)) {
        throw new Error('Invalid CVV');
      }
      if (!cardholderName.trim()) {
        throw new Error('Invalid cardholder name');
      }

      // Generate a mock transaction ID
      const transactionId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const currentDate = new Date().toLocaleString();
      
      // Create payment details object
      const paymentDetails = {
        transactionId,
        cardNumber: cardNumber.slice(-4), // Only store last 4 digits
        cardholderName,
        amount: total,
        date: currentDate
      };
      
      // Process enrollments one by one to handle errors better
      const enrollmentResults: { course: Course; enrollment: any }[] = [];
      
      // First, try to enroll in all courses
      for (const course of cartItems) {
        try {
          const response = await enrollInCourse(course._id, user!._id, token!, paymentDetails);
          enrollmentResults.push(response);
        } catch (error: any) {
          // If enrollment fails for any course, throw error with details
          throw new Error(`Failed to enroll in ${course.title}: ${error.message}`);
        }
      }
      
      // If all enrollments are successful, send notifications
      for (const course of cartItems) {
        try {
          await sendCoursePurchaseNotification(
            user!._id,
            course.title,
            {
              amount: course.price,
              currency: 'INR',
              transactionId
            }
          );
        } catch (error) {
          console.error('Error sending notification:', error);
          // Don't throw error here, as enrollment was successful
        }
      }
      
      // If we get here, all enrollments were successful
      // Set payment details for receipt
      setPaymentDetails({
        transactionId,
        amount: total,
        date: currentDate,
        courses: cartItems.map((course, index) => ({
          ...course,
          enrollmentId: enrollmentResults[index].enrollment._id
        }))
      });
      
      // Show success state
      setPaymentSuccess(true);
      
      // Clear cart after successful payment
      clearCart();
      
      toast.success('Payment successful! You are now enrolled in the course(s).');
    } catch (error: any) {
      console.error('Payment or enrollment failed:', error);
      
      // Show specific error message
      if (error.message.includes('Already enrolled')) {
        toast.error('You are already enrolled in one or more of these courses. Please remove them from your cart.');
      } else {
        toast.error(error.message || 'Payment failed. Please try again.');
      }
      
      // Ensure payment success is false in case of error
      setPaymentSuccess(false);
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