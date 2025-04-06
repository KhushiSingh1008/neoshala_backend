import Notification from '../models/Notification.js';

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.userId - User ID to notify
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.type - Notification type (course_purchase, payment_confirmation, etc.)
 * @param {Object} notificationData.data - Additional data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification({
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      data: notificationData.data || {},
      read: false
    });

    await notification.save();
    console.log(`Notification created for user ${notificationData.userId}: ${notificationData.title}`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create a course purchase notification
 * @param {string} userId - User ID
 * @param {Object} course - Course object
 * @param {Object} paymentDetails - Payment details
 * @returns {Promise<Object>} Created notification
 */
export const createCoursePurchaseNotification = async (userId, course, paymentDetails) => {
  return createNotification({
    userId,
    title: 'Course Enrollment Successful',
    message: `You have successfully enrolled in "${course.title}"`,
    type: 'course_purchase',
    data: {
      courseId: course._id,
      courseTitle: course.title,
      instructorName: course.instructor.username,
      paymentDetails
    }
  });
};

/**
 * Create a payment confirmation notification
 * @param {string} userId - User ID
 * @param {Object} paymentDetails - Payment details
 * @returns {Promise<Object>} Created notification
 */
export const createPaymentConfirmationNotification = async (userId, paymentDetails) => {
  return createNotification({
    userId,
    title: 'Payment Successful',
    message: `Your payment of ₹${paymentDetails.amount} has been successfully processed`,
    type: 'payment_confirmation',
    data: {
      amount: paymentDetails.amount,
      currency: paymentDetails.currency || 'INR',
      transactionId: paymentDetails.transactionId,
      paymentMethod: paymentDetails.paymentMethod
    }
  });
};

/**
 * Create a course rejection notification for an instructor
 * @param {string} instructorId - Instructor user ID
 * @param {Object} course - Course object
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<Object>} Created notification
 */
export const createCourseRejectionNotification = async (instructorId, course, rejectionReason) => {
  return createNotification({
    userId: instructorId,
    title: 'Course Rejected',
    message: `Your course "${course.title}" has been rejected by admin`,
    type: 'course_update',
    data: {
      courseId: course._id,
      courseTitle: course.title,
      rejectionReason: rejectionReason,
      status: 'rejected'
    }
  });
}; 