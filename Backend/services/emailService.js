import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

export const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Email Verification',
      html: `
        <h1>Verify Your Email</h1>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    });
    
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset',
      html: `
        <h1>Reset Your Password</h1>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
    
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to NeoShala',
      html: `
        <h1>Welcome to NeoShala!</h1>
        <p>Hello ${username},</p>
        <p>Thank you for joining NeoShala. We're excited to have you as a member of our learning community.</p>
        <p>You can now explore courses, enroll in your favorite ones, and start your learning journey.</p>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Happy learning!</p>
        <p>Best regards,</p>
        <p>The NeoShala Team</p>
      `
    });
    
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

export const sendCourseEnrollmentEmail = async (email, username, course) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `NeoShala: Your Enrollment in ${course.title} is Confirmed!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <h1 style="color: #4a154b; margin-bottom: 20px;">Course Enrollment Confirmed!</h1>
          
          <p>Hello ${username},</p>
          
          <p>Thank you for enrolling in <strong>${course.title}</strong>. Your purchase has been completed successfully!</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Course Details:</h3>
            <p><strong>Course:</strong> ${course.title}</p>
            <p><strong>Instructor:</strong> ${course.instructor.username}</p>
            <p><strong>Duration:</strong> ${course.duration}</p>
            <p><strong>Level:</strong> ${course.level}</p>
            <p><strong>Amount Paid:</strong> ₹${course.price}</p>
          </div>
          
          <p>You can access your course immediately by visiting your <a href="${process.env.FRONTEND_URL}/dashboard">dashboard</a>.</p>
          
          <p>If you have any questions about the course, please contact us at <a href="mailto:support@neoshala.com">support@neoshala.com</a>.</p>
          
          <p>Happy learning!</p>
          
          <p>Best regards,<br>The NeoShala Team</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; font-size: 12px; color: #666;">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      `
    });
    
    console.log(`Course enrollment confirmation email sent to ${email} for course: ${course.title}`);
    return true;
  } catch (error) {
    console.error('Error sending course enrollment email:', error);
    return false;
  }
}; 