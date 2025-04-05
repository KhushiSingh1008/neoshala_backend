import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Browse our courses and add some to your cart!</p>
        <Link to="/explore" className="browse-courses-btn">Browse Courses</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map(course => (
            <div key={course._id} className="cart-item">
              <div className="item-image">
                <img
                  src={course.imageUrl?.startsWith('http') ? course.imageUrl : `http://localhost:5000${course.imageUrl}` || 'https://via.placeholder.com/150'}
                  alt={course.title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>
              <div className="item-details">
                <h3>{course.title}</h3>
                <p className="instructor">By {course.instructor?.username}</p>
                <p className="price">₹{course.price}</p>
              </div>
              <button
                onClick={() => removeFromCart(course._id)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2>Cart Summary</h2>
          <div className="summary-details">
            <div className="summary-row">
              <span>Total Items:</span>
              <span>{cartItems.length}</span>
            </div>
            <div className="summary-row">
              <span>Total Amount:</span>
              <span>₹{total}</span>
            </div>
          </div>
          <div className="cart-actions">
            <button onClick={clearCart} className="clear-cart-btn">
              Clear Cart
            </button>
            <Link to="/checkout" className="checkout-btn">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 